'use server'

import { prisma } from '@/lib/prisma'

export async function getSmartTemplatesForBooking(templeId: string, serviceType: string) {
  // Ideally, docType maps to serviceType (GAMOS -> gamos, BAPTISM -> vaptisi)
  // Let's assume some basic mapping or just returning all templates for the temple for now
  const mappedDocType = serviceType === 'GAMOS' ? 'gamos' : serviceType === 'BAPTISM' ? 'vaptisi' : 'other';

  const templates = await prisma.docTemplate.findMany({
    where: { templeId, docType: mappedDocType },
    select: { id: true, nameEl: true, conditionRules: true, htmlContent: true, context: true }
  });

  return templates.map(t => {
    // Extract variables from HTML
    const regex = /\{\{([^}]+)\}\}/g;
    let m;
    const vars = new Set<string>();
    let format = 'mustache';

    while ((m = regex.exec(t.htmlContent || '')) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++;
      vars.add(m[1].trim());
    }

    // Extract variables from context (DOCX)
    try {
      if (t.context) {
        const parsed = JSON.parse(t.context);
        if (Array.isArray(parsed)) {
          parsed.forEach(v => vars.add(v));
        } else {
          if (parsed.format) format = parsed.format;
          if (Array.isArray(parsed.vars)) parsed.vars.forEach((v: string) => vars.add(v));
        }
      }
    } catch {}

    // Extract condition variable (e.g. {{OIKOG_STATUS}} == 'ΧΗΡΕΙΑ' -> OIKOG_STATUS)
    let conditionVariable = null;
    let conditionTargetValue = null;
    if (t.conditionRules) {
      const condMatch = t.conditionRules.match(/\{\{([^}]+)\}\}\s*==\s*['"]([^'"]+)['"]/);
      if (condMatch) {
        conditionVariable = condMatch[1].trim();
        conditionTargetValue = condMatch[2].trim();
      }
    }

    return {
      id: t.id,
      nameEl: t.nameEl,
      conditionRuleRaw: t.conditionRules,
      conditionVariable,
      conditionTargetValue,
      format,
      variables: Array.from(vars)
    };
  });
}

export async function submitBookingRequest(templeId: string, slotId: string, answers: Record<string, string>) {
  // Lock the slot
  await prisma.bookingSlot.update({
    where: { id: slotId },
    data: { isBooked: true }
  });
  
  // Setup Applicant Details quickly
  const applicantName = answers['ΟΝΟΜΑΤΕΠΩΝΥΜΟ_ΑΙΤΟΥΝΤΟΣ'] || answers['ΟΝΟΜΑ_ΑΙΤΟΥΝΤΟΣ'] || answers['ΟΝΟΜΑ'] || 'Νέος Αιτών';
  const applicantEmail = answers['EMAIL'] || null;
  const applicantPhone = answers['ΤΗΛΕΦΩΝΟ'] || answers['ΚΙΝΗΤΟ'] || null;

  // Create the CitizenRequest
  const request = await prisma.citizenRequest.create({
    data: {
      templeId,
      bookingSlotId: slotId,
      type: 'BOOKING_REQUEST',
      status: 'INTERESTED',
      applicantName,
      applicantEmail,
      applicantPhone,
      templateAnswers: JSON.stringify(answers),
      payload: JSON.stringify({ bookingRequest: true, ...answers })
    }
  });

  return { success: true, trackingId: request.id };
}

import { randomBytes } from 'crypto';

export async function submitPublicBooking(data: {
  templeId: string;
  slotId: string;
  serviceType: string;
  name: string;
  phone: string;
  email: string;
}) {
  const randomHash = randomBytes(32).toString('hex');

  // 1. Lock the slot
  const slot = await prisma.bookingSlot.update({
    where: { id: data.slotId },
    data: {
      isBooked: true,
      connectTokenHash: randomHash
    }
  });

  // 2. Create the Token
  const token = await prisma.token.create({
    data: {
      templeId: data.templeId,
      tokenStr: randomHash,
      serviceType: data.serviceType,
      status: 'pending',
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email,
      ceremonyDate: slot.startTime,
      submissionComplete: false
    }
  });

  // 3. Create the empty CeremonyMeta
  await prisma.ceremonyMeta.create({
    data: {
      tokenId: token.id,
      dataJson: '{}'
    }
  });

  return { success: true, tokenStr: randomHash };
}

function createAthensDate(year: number, month: number, date: number, hours: number, minutes: number): Date {
  const base = new Date(Date.UTC(year, month, date, hours, minutes));
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(base);
  const partMap: Record<string, number> = {};
  parts.forEach(p => {
    if (p.type !== 'literal') {
      partMap[p.type] = parseInt(p.value, 10);
    }
  });
  
  const tzDateMs = Date.UTC(partMap.year, partMap.month - 1, partMap.day, partMap.hour, partMap.minute, 0);
  const diffMs = tzDateMs - base.getTime();
  const targetMs = Date.UTC(year, month, date, hours, minutes, 0) - diffMs;
  return new Date(targetMs);
}

export async function generateBookingSlotsForTemple(templeId: string, schedule: any) {
  const disabledDays = schedule?.disabledDaysOfWeek ?? [1, 3];
  const timeSlots = schedule?.timeSlots ?? ['17:00', '18:00', '19:00', '20:00'];
  const exceptionalDates = schedule?.exceptionalDisabledDates ?? [];
  const duration = schedule?.gamosDurationMin ?? 45;

  const today = new Date();

  // Clear unbooked future slots
  await prisma.bookingSlot.deleteMany({
    where: {
      templeId,
      isBooked: false,
      startTime: { gte: today }
    }
  });

  const slotsToCreate: { templeId: string; serviceType: string; startTime: Date; endTime: Date; isBooked: boolean }[] = [];

  for (let i = 1; i <= 60; i++) {
    const candidateDate = new Date(today);
    candidateDate.setDate(today.getDate() + i);
    
    // Check if day of week is disabled
    const dayOfWeek = candidateDate.getDay();
    if (disabledDays.includes(dayOfWeek)) {
      continue;
    }
    
    // Check if exceptional date YYYY-MM-DD
    const year = candidateDate.getFullYear();
    const month = String(candidateDate.getMonth() + 1).padStart(2, '0');
    const day = String(candidateDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    if (exceptionalDates.includes(dateStr)) {
      continue;
    }
    
    for (const time of timeSlots) {
      const [hoursStr, minutesStr] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      const slotStart = createAthensDate(
        candidateDate.getFullYear(),
        candidateDate.getMonth(),
        candidateDate.getDate(),
        hours,
        minutes
      );
      
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      slotsToCreate.push({
        templeId,
        serviceType: 'ANY',
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: false
      });
    }
  }

  if (slotsToCreate.length > 0) {
    await prisma.bookingSlot.createMany({
      data: slotsToCreate
    });
  }

  return { success: true };
}

