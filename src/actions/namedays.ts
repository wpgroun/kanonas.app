'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getCelebratingNamesForDate, normalizeGreekName } from '@/lib/namedays'

export async function getUpcomingNamedays(daysAhead: number = 7) {
  const session = await getSession()
  const templeId = session?.templeId
  
  if (!templeId) {
     return []
  }

  // Generate the next N dates
  const today = new Date()
  const dateMap: { date: Date, mmdd: string, celebratingNames: string[] }[] = []
  
  for (let i = 0; i < daysAhead; i++) {
     const d = new Date(today)
     d.setDate(d.getDate() + i)
     
     const celebratingNames = getCelebratingNamesForDate(d)
     if (celebratingNames.length > 0) {
        dateMap.push({
           date: d,
           mmdd: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
           celebratingNames
        })
     }
  }

  // Fetch all active parishioners for the temple
  const parishioners = await prisma.parishioner.findMany({
     where: { 
        templeId,
        status: 'active'
     },
     select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        mobile: true
     }
  })

  // Match them
  const results: {
    parishionerId: string;
    fullName: string;
    firstName: string;
    phone: string | null;
    celebrationDate: Date;
    feastStr: string;
  }[] = []

  for (const p of parishioners) {
     const normName = normalizeGreekName(p.firstName)

     for (const day of dateMap) {
         // Check if this date has a match for the parishioner's name
         let isMatch = false;
         for (const celeb of day.celebratingNames) {
             if (normName === celeb || (normName.length > 4 && normName.startsWith(celeb.substring(0,4)))) {
                 isMatch = true;
                 break;
             }
         }

         if (isMatch) {
             results.push({
                 parishionerId: p.id,
                 fullName: `${p.firstName} ${p.lastName}`,
                 firstName: p.firstName,
                 phone: p.mobile || p.phone || null,
                 celebrationDate: day.date,
                 feastStr: day.celebratingNames[0] // just take the primary name of the feast
             })
             break; // don't add the same person multiple times if somehow they match multiple
         }
     }
  }

  // Sort chronologically
  results.sort((a,b) => a.celebrationDate.getTime() - b.celebrationDate.getTime())

  return results
}
