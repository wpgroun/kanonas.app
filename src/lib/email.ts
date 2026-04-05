import nodemailer from 'nodemailer';

// By default, if no SMTP is configured, we will log the email instead of failing hard.
// Once in production, configure SMTP host in `.env`
const transporter = nodemailer.createTransport({
 host: process.env.SMTP_HOST || 'smtp.ethereal.email',
 port: Number(process.env.SMTP_PORT) || 587,
 secure: process.env.SMTP_SECURE === 'true',
 auth: {
 user: process.env.SMTP_USER || 'ethereal_user',
 pass: process.env.SMTP_PASS || 'ethereal_pass',
 },
});

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
 // Mock mode for local MVP development
 if (!process.env.SMTP_HOST) {
 console.log(`\n[EMAIL MOCK - TEST MODE]`);
 console.log(`📧 To: ${to}`);
 console.log(`📌 Subject: ${subject}`);
 console.log(`✉️ Content: ${text || 'HTML Content inside'}\n`);
 return { success: true, mock: true };
 }

 try {
 const info = await transporter.sendMail({
 from: `"Ιερός Ναός (Κανόνας)"<${process.env.SMTP_USER || 'noreply@kanonas.gr'}>`,
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


