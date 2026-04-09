'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { generateFromTemplate } from './docEngine';
import { randomUUID } from 'crypto';
import { headers } from 'next/headers';

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

export async function assignPriest(requestId: string, priestId: string) {
  const session = await requireAuth();
  
  const req = await prisma.citizenRequest.findUnique({ where: { id: requestId } });
  if (!req || req.templeId !== session.templeId) throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");

  return prisma.citizenRequest.update({
    where: { id: requestId },
    data: { assignedPriestId: priestId }
  });
}

export async function confirmRequest(requestId: string) {
  const session = await requireAuth();
  
  const req = await prisma.citizenRequest.findUnique({ where: { id: requestId } });
  if (!req || req.templeId !== session.templeId) throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");

  // For future: Send email to citizen
  
  return prisma.citizenRequest.update({
    where: { id: requestId },
    data: { status: 'CONFIRMED' }
  });
}

export async function rejectRequest(requestId: string, reason?: string) {
  const session = await requireAuth();
  
  const req = await prisma.citizenRequest.findUnique({ where: { id: requestId } });
  if (!req || req.templeId !== session.templeId) throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");

  // For future: Send email to citizen with reason
  
  return prisma.citizenRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });
}

export async function generateRequestDocuments(requestId: string) {
  const session = await requireAuth();
  
  const req = await prisma.citizenRequest.findUnique({ 
    where: { id: requestId },
    include: { temple: true }
  });
  
  if (!req || req.templeId !== session.templeId) {
    throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");
  }
  
  let answers: Record<string, string> = {};
  if (req.templateAnswers) {
    try { answers = JSON.parse(req.templateAnswers); } catch(e){}
  }
  
  let currentProtocol = 1;
  let templeSettings: any = {};
  if (req.temple.settings) {
     try { templeSettings = JSON.parse(req.temple.settings); } catch(e){}
  }
  if (templeSettings.currentProtocolNumber) {
     currentProtocol = parseInt(templeSettings.currentProtocolNumber, 10) + 1;
  }
  templeSettings.currentProtocolNumber = currentProtocol;
  const year = new Date().getFullYear();
  const protocolNumber = `${currentProtocol}/${year}`;
  
  await prisma.temple.update({
    where: { id: req.templeId },
    data: { settings: JSON.stringify(templeSettings) }
  });
  
  answers['ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ'] = protocolNumber;
  
  const templates = await prisma.docTemplate.findMany({
    where: { templeId: req.templeId, docType: req.type }
  });
  
  const citizenDocs: any[] = [];
  const internalDocs: any[] = [];
  
  for (const tpl of templates) {
    const res = await generateFromTemplate(tpl.id, answers);
    if (res.success) {
      const docEntry = {
         id: tpl.id,
         name: tpl.nameEl,
         visibility: tpl.visibility,
         type: (res as any).type,
         base64: (res as any).base64,
         html: (res as any).html,
         filename: (res as any).filename
      };
      if (tpl.visibility === 'citizen') citizenDocs.push(docEntry);
      else internalDocs.push(docEntry);
    }
  }
  
  const allDocs = [...citizenDocs, ...internalDocs];
  const generatedDocsJson = JSON.stringify(allDocs);
  const signatureToken = randomUUID();
  
  await prisma.citizenRequest.update({
    where: { id: requestId },
    data: { 
       status: 'DOCS_GENERATED',
       protocolNumber,
       generatedDocs: generatedDocsJson,
       signatureToken
    }
  });

  if (req.applicantEmail) {
    const { sendEmail } = await import('./notifications');
    const contactInfo = [
      req.temple.name,
      req.temple.phoneNumber ? `Τηλ: ${req.temple.phoneNumber}` : null,
      req.temple.address
    ].filter(Boolean).join(' • ');

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kanonas.app';
      
      await sendEmail({
      to: req.applicantEmail,
      subject: `Τα έγγραφά σας είναι έτοιμα — ${req.temple.name}`,
      title: 'Τα Έγγραφά σας είναι Έτοιμα',
      greeting: `Αγαπητέ/ή ${req.applicantName},`,
      body: `
        <p>Τα έγγραφά σας για <b>${req.type}</b> έχουν εκδοθεί και είναι έτοιμα (Αριθμός Πρωτοκόλλου: <b>${protocolNumber}</b>).</p>
        <p>Παρακαλούμε <a href="${baseUrl}/sign/${signatureToken}" style="font-weight:bold;color:#4f46e5;text-decoration:underline;">υπογράψτε ψηφιακά τα έγγραφά σας κάνοντας κλικ εδώ.</a></p>
        <p>Εναλλακτικά, επισκεφθείτε την παρακάτω διεύθυνση στο πρόγραμμα περιήγησής σας:<br/>
        <a href="${baseUrl}/sign/${signatureToken}">${baseUrl}/sign/${signatureToken}</a></p>
        <p>Μετά την υπογραφή, μπορείτε να επικοινωνήσετε με τον Ναό για την παραλαβή του πρωτοτύπου.</p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e8e8ee; font-size: 12px; color: #6b7280;">
          ${contactInfo}
        </div>
      `,
      templeId: req.templeId
    });
  }

  return { success: true, citizenDocs, internalDocs, protocolNumber };
}

export async function getRequestDocuments(requestId: string) {
  const session = await requireAuth();
  
  const req = await prisma.citizenRequest.findUnique({ 
    where: { id: requestId }
  });
  
  if (!req || req.templeId !== session.templeId) {
    throw new Error("Δεν βρέθηκε η αίτηση ή δεν έχετε δικαίωμα.");
  }
  
  if (!req.generatedDocs) {
    return { success: true, docs: [] };
  }
  
  try {
    const docs = JSON.parse(req.generatedDocs);
    return { success: true, docs };
  } catch (e) {
    return { success: false, error: 'Σφάλμα ανάγνωσης εγγράφων' };
  }
}

export async function signDocuments(token: string) {
  const req = await prisma.citizenRequest.findUnique({
    where: { signatureToken: token }
  });
  
  if (!req) return { success: false, error: 'invalid_token' };
  if (req.signedAt) return { success: false, error: 'already_signed' };
  
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('remote-addr') || 'unknown';
  
  await prisma.citizenRequest.update({
    where: { id: req.id },
    data: {
      signedAt: new Date(),
      signatureIp: ip,
      status: 'COMPLETED'
    }
  });

  return { success: true, applicantName: req.applicantName, protocol: req.protocolNumber };
}
