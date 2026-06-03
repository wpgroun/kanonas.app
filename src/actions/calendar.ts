'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';
import { startOfMonth, endOfMonth } from 'date-fns';

// ─── Unified Calendar Event Type ───────────────────────────────────────────────

export type CalendarEventType = 'SERVICE' | 'CEREMONY_MARRIAGE' | 'CEREMONY_BAPTISM' | 'CEREMONY_FUNERAL' | 'CENTRAL_EVENT' | 'SISSITIO';

export interface AggregatedCalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string; // ISO string
  time?: string; // "HH:MM" optional
  color: string;
  details?: string;
  isMajor?: boolean;
  href?: string; // link to detail page if applicable
}

// ─── Color map ─────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<CalendarEventType, string> = {
  SERVICE: '#e11d48',            // rose-600 — Ακολουθίες
  CEREMONY_MARRIAGE: '#7c3aed',  // violet-600 — Γάμοι
  CEREMONY_BAPTISM: '#0ea5e9',   // sky-500 — Βαπτίσεις
  CEREMONY_FUNERAL: '#6b7280',   // gray-500 — Κηδείες
  CENTRAL_EVENT: '#f59e0b',      // amber-500 — Γεγονότα ενορίας
  SISSITIO: '#10b981',           // emerald-500 — Φιλόπτωχο / Συσσίτιο
};

/**
 * Aggregates all calendar-relevant events for the current temple
 * into a unified list, for a given year/month range.
 */
export async function getAggregatedCalendarEvents(year: number, month: number): Promise<{ success: boolean; data?: AggregatedCalendarEvent[]; error?: string }> {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  // Self-healing background cleanup of duplicate schedules (runs once per server process)
  if (!(global as any)._schedulesCleaned) {
    prisma.serviceSchedule.deleteMany({
      where: {
        description: {
          contains: 'Δεσμευμένο από αίτηση'
        }
      }
    }).then(res => {
      logger.info(`[Calendar Cleanup] Deleted ${res.count} duplicate service schedule records.`);
      (global as any)._schedulesCleaned = true;
    }).catch(err => {
      logger.error('[Calendar Cleanup] Error:', err);
    });
  }

  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(new Date(year, month - 1, 1));

  const temple = await prisma.temple.findUnique({ where: { id: templeId }, select: { metropolisId: true } });

  try {
    const [services, ceremonies, centralEvents, sissitio, tokens] = await Promise.all([
      // 1. Church services (ακολουθίες)
      prisma.serviceSchedule.findMany({
        where: { templeId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),

      // 2. Ceremonies (γάμοι, βαπτίσεις, κηδείες)
      prisma.ceremony.findMany({
        where: { templeId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),

      // 3. Central events (ενορία + μητρόπολη + global)
      prisma.centralEvent.findMany({
        where: {
          OR: [
            { templeId },
            { metropolisId: temple?.metropolisId ?? undefined },
            { metropolisId: null, templeId: null },
          ],
          startDate: { gte: start, lte: end },
        },
        orderBy: { startDate: 'asc' },
      }),

      // 4. Sissitio days (συσσίτιο φιλοπτώχου)
      prisma.sissitioDay.findMany({
        where: { templeId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),

      // 5. Approved sacrament requests (Tokens)
      prisma.token.findMany({
        where: {
          templeId,
          ceremonyDate: { gte: start, lte: end },
          status: { in: ['accepted', 'docs_generated', 'completed'] },
        },
        orderBy: { ceremonyDate: 'asc' },
      }),
    ]);

    const events: AggregatedCalendarEvent[] = [];

    // Map services
    for (const s of services) {
      const d = new Date(s.date);
      events.push({
        id: s.id,
        type: 'SERVICE',
        title: s.title,
        date: s.date.toISOString(),
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        color: s.isMajor ? '#dc2626' : TYPE_COLORS.SERVICE,
        details: s.description ?? undefined,
        isMajor: s.isMajor,
      });
    }

    // Map ceremonies
    for (const c of ceremonies) {
      const typeKey = c.type === 'MARRIAGE' ? 'CEREMONY_MARRIAGE' : c.type === 'BAPTISM' ? 'CEREMONY_BAPTISM' : 'CEREMONY_FUNERAL';
      const typeLabel = c.type === 'MARRIAGE' ? 'Γάμος' : c.type === 'BAPTISM' ? 'Βάπτιση' : 'Κηδεία';
      const statusLabel = c.status === 'COMPLETED' ? '✓' : c.status === 'CANCELLED' ? '✗' : '';

      let detailsObj: Record<string, any> = {};
      try { detailsObj = JSON.parse(c.detailsJson); } catch {}

      let subtitle = '';
      if (c.type === 'MARRIAGE') {
        subtitle = [detailsObj.groom?.lastName, detailsObj.bride?.lastName].filter(Boolean).join(' & ') || '';
      } else if (c.type === 'BAPTISM') {
        subtitle = detailsObj.child?.firstName || '';
      } else if (c.type === 'FUNERAL') {
        subtitle = [detailsObj.deceased?.firstName, detailsObj.deceased?.lastName].filter(Boolean).join(' ') || '';
      }

      events.push({
        id: c.id,
        type: typeKey as CalendarEventType,
        title: `${typeLabel}${subtitle ? ` — ${subtitle}` : ''} ${statusLabel}`.trim(),
        date: c.date.toISOString(),
        color: TYPE_COLORS[typeKey as CalendarEventType],
        details: c.priest ? `Ιερουργών: ${c.priest}` : undefined,
        href: `/admin/ceremonies/${c.id}`,
      });
    }

    // Map tokens (approved/advanced requests)
    for (const t of tokens) {
      if (!t.ceremonyDate) continue;
      const typeKey = t.serviceType === 'GAMOS' ? 'CEREMONY_MARRIAGE' : 'CEREMONY_BAPTISM';
      const typeLabel = t.serviceType === 'GAMOS' ? '💍 Γάμος (Αίτηση)' : '🕊️ Βάπτιση (Αίτηση)';
      const statusLabel = t.status === 'completed' ? '✓' : '';

      const d = new Date(t.ceremonyDate);
      events.push({
        id: t.id,
        type: typeKey as CalendarEventType,
        title: `${typeLabel} — ${t.customerName || 'Οικογένεια'}${statusLabel ? ` ${statusLabel}` : ''}`.trim(),
        date: t.ceremonyDate.toISOString(),
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        color: TYPE_COLORS[typeKey as CalendarEventType],
        details: t.assignedPriest ? `Ιερουργών: ${t.assignedPriest}` : undefined,
        href: `/admin/requests/${t.id}`,
      });
    }

    // Map central events
    for (const ev of centralEvents) {
      const color = ev.color || TYPE_COLORS.CENTRAL_EVENT;
      events.push({
        id: ev.id,
        type: 'CENTRAL_EVENT',
        title: ev.title,
        date: ev.startDate.toISOString(),
        time: ev.startTime ?? undefined,
        color,
        details: ev.description ?? undefined,
      });
    }

    // Map sissitio
    for (const s of sissitio) {
      events.push({
        id: s.id,
        type: 'SISSITIO',
        title: `Συσσίτιο${s.menu ? ` — ${s.menu}` : ''}`,
        date: s.date.toISOString(),
        color: TYPE_COLORS.SISSITIO,
        details: s.totalPortions ? `${s.totalPortions} μερίδες` : undefined,
        href: `/admin/philanthropy/schedule`,
      });
    }

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { success: true, data: events };
  } catch (e) {
    logger.error('getAggregatedCalendarEvents error:', e);
    return { success: false, error: 'Σφάλμα ανάκτησης ημερολογίου.' };
  }
}



export async function getCentralEvents() {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 
 // We fetch Metropolis ID from temple if possible, or just the temple's events
 const temple = await prisma.temple.findUnique({ where: {id: templeId}, select: { metropolisId: true } });

 try {
 const events = await prisma.centralEvent.findMany({
 where: {
 OR: [
 { templeId: templeId }, // Parish level events
 { metropolisId: temple?.metropolisId }, // Metropolis level events
 { metropolisId: null, templeId: null } // Super global events
 ]
 },
 orderBy: { startDate: 'asc' }
 });

 return { success: true, data: events };
 } catch(e) {
 return { success: false, error: 'Σφάλμα ανάκτησης ημερολογίου.' };
 }
}

export async function addCentralEvent(data: any) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 const created = await prisma.centralEvent.create({
 data: {
 templeId: session.isSuperAdmin ? null : templeId, // Super admin creates global, priest creates parish
 title: data.title,
 description: data.description,
 startDate: new Date(data.startDate),
 endDate: new Date(data.endDate),
 startTime: data.startTime || null,
 endTime: data.endTime || null,
 category: data.category,
 color: data.color || '#3b82f6', // Default blue
 }
 });

 revalidatePath('/admin/calendar');
 return { success: true, data: created };
 } catch(e) {
 return { success: false, error: 'Αποτυχία δημιουργίας συμβάντος.' };
 }
}

export async function deleteCentralEvent(id: string) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 const event = await prisma.centralEvent.findUnique({where: {id}});
 if (!event) return {success:false};
 // Basic ownership check
 if (!session.isSuperAdmin && event.templeId !== templeId) {
 return {success:false, error:'Δεν έχετε δικαίωμα διαγραφής'};
 }

 await prisma.centralEvent.delete({ where: { id } });
 revalidatePath('/admin/calendar');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Σφάλμα διαγραφής συμβάντος.' };
 }
}
