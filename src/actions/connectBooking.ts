'use server'

import { prisma } from '@/lib/prisma'

export async function getSmartTemplatesForBooking(templeId: string, serviceType: string) {
  // Ideally, docType maps to serviceType (GAMOS -> gamos, BAPTISM -> vaptisi)
  // Let's assume some basic mapping or just returning all templates for the temple for now
  const mappedDocType = serviceType === 'GAMOS' ? 'gamos' : serviceType === 'BAPTISM' ? 'vaptisi' : 'other';

  const templates = await prisma.docTemplate.findMany({
    where: { templeId, docType: mappedDocType },
    select: { id: true, nameEl: true, conditionRules: true, htmlContent: true }
  });

  return templates.map(t => {
    // Extract variables from HTML
    const regex = /\{\{([^}]+)\}\}/g;
    let m;
    const vars = new Set<string>();
    while ((m = regex.exec(t.htmlContent || '')) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++;
      vars.add(m[1].trim());
    }

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
      variables: Array.from(vars)
    };
  });
}

export async function submitBookingRequest(templeId: string, slotId: string, answers: Record<string, string>) {
  // Logic to lock the slot and create a Token with answers Json
  await prisma.bookingSlot.update({
    where: { id: slotId },
    data: { isBooked: true }
  });
  
  // Here we would typically create a Token and CeremonyMeta
  // For the sake of the demo MVP, we will just return success
  
  return { success: true };
}
