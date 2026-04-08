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
