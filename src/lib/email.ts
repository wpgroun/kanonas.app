import nodemailer from 'nodemailer';

import { prisma } from '@/lib/prisma';

export async function sendEmail({
 to,
 subject,
 html,
 text
}: {
 to: string;
 subject: string;
 html?: string;
 text?: string;
}) {
 const platformSettings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
 const smtpHost = platformSettings?.smtpHost || process.env.SMTP_HOST;
 const smtpPort = platformSettings?.smtpPort || process.env.SMTP_PORT;
 const smtpUser = platformSettings?.smtpUser || process.env.SMTP_USER;
 const smtpPass = platformSettings?.smtpPass || process.env.SMTP_PASS;

 // Mock mode for local MVP development
 if (!smtpHost) {
 console.log(`\n[EMAIL MOCK - TEST MODE]`);
 console.log(`📧 To: ${to}`);
 console.log(`📌 Subject: ${subject}`);
 console.log(`✉️ Content: ${text || 'HTML Content inside'}\n`);
 return { success: true, mock: true };
 }

 try {
 const transporter = nodemailer.createTransport({
 host: smtpHost,
 port: Number(smtpPort) || 587,
 secure: process.env.SMTP_SECURE === 'true' || Number(smtpPort) === 465,
 auth: {
 user: smtpUser || 'ethereal_user',
 pass: smtpPass || 'ethereal_pass',
 },
 });

 const info = await transporter.sendMail({
 from: `"Ιερός Ναός (Κανόνας)"<${smtpUser || 'noreply@kanonas.gr'}>`,
 to,
 subject,
 text,
 html,
 });

 console.log('Message sent: %s', info.messageId);
 return { success: true, messageId: info.messageId };
 } catch (error: any) {
 console.error('Email Sending failed:', error);
 return { success: false, error: error.message };
 }
}


