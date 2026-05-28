import nodemailer from 'nodemailer';
import dns from 'dns';
import { prisma } from '@/lib/prisma';

export interface SMTPConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export async function resolveHostToIPv4(host: string): Promise<string> {
  if (!host) return host;
  // If already an IP address, return it
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) {
    return host;
  }
  return new Promise<string>((resolve) => {
    // 5-second timeout — prevents hanging forever if DNS is slow/unreachable
    const timer = setTimeout(() => resolve(host), 5000);
    dns.lookup(host, { family: 4 }, (err, address) => {
      clearTimeout(timer);
      if (err) resolve(host);
      else resolve(address);
    });
  });
}

export async function createSafeTransporter(config: SMTPConfig) {
  const resolvedHost = await resolveHostToIPv4(config.host);
  return nodemailer.createTransport({
    ...config,
    host: resolvedHost,
    tls: {
      servername: config.host,
      ...((config as any).tls || {}),
    },
  } as any);
}

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
    const transporter = await createSafeTransporter({
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
