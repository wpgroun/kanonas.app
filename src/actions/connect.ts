'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';

export async function submitCitizenRequest({
 templeSlug,
 type,
 applicantName,
 applicantEmail,
 applicantPhone,
 payload
}: {
 templeSlug: string;
 type: string;
 applicantName: string;
 applicantEmail?: string;
 applicantPhone?: string;
 payload: any;
}) {
 // Find the temple by its public slug
 const temple = await prisma.temple.findUnique({
 where: { slug: templeSlug }
 });

 if (!temple) throw new Error("Ο Ναός δεν βρέθηκε.");

 // Create the request
 const request = await prisma.citizenRequest.create({
 data: {
 templeId: temple.id,
 type,
 applicantName,
 applicantEmail,
 applicantPhone,
 payload: JSON.stringify(payload)
 }
 });

 return request.id;
}

export async function getTempleRequests() {
 const session = await requireAuth();
 const templeId = session.templeId;

 const requests = await prisma.citizenRequest.findMany({
 where: { templeId },
 orderBy: { createdAt: 'desc' }
 });

 return requests.map(r => ({
 ...r,
 payload: JSON.parse(r.payload)
 }));
}

export async function updateRequestStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
 const session = await requireAuth();
 const templeId = session.templeId;

 // Security check
 const req = await prisma.citizenRequest.findUnique({ where: { id } });
 if (!req || req.templeId !== templeId) throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");

 const updated = await prisma.citizenRequest.update({
 where: { id },
 data: { status }
 });

 return updated;
}

// Anonymous method for citizens to track their requests
export async function trackCitizenRequest(id: string) {
 try {
  const request = await prisma.citizenRequest.findUnique({
   where: { id },
   select: { id: true, type: true, status: true, applicantName: true, createdAt: true, temple: { select: { name: true } } }
  });
  return request;
 } catch (e) {
  return null;
 }
}

export async function getTempleDocTypes(templeSlug: string) {
  const temple = await prisma.temple.findUnique({ where: { slug: templeSlug } });
  if (!temple) return [];

  const templates = await prisma.docTemplate.findMany({
    where: { templeId: temple.id }
  });

  return templates.map(t => {
    let vars: string[] = [];
    let format = 'mustache';
    try {
      if (t.context) {
        const parsed = JSON.parse(t.context);
        if (Array.isArray(parsed)) {
          vars = parsed;
        } else {
          vars = parsed.vars || [];
          format = parsed.format || 'mustache';
        }
      }
    } catch {}
    
    return {
      id: t.id,
      nameEl: t.nameEl,
      docType: t.docType,
      vars,
      format
    };
  });
}
