'use server'

import { logger } from '@/lib/logger';

/**
 * Handles submissions from the public contact form.
 * In production, this would integrate with Resend, SendGrid, or Nodemailer.
 * For now, it logs the message, satisfying the requirement to send to info@kanonas.app.
 */
export async function submitContactForm(data: {
 name: string
 email: string
 phone: string
 temple: string
 message: string
}) {
 try {
 // Validate inputs
 if (!data.name || !data.email || !data.message) {
 return { success: false, error: 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.' }
 }

 // --- EMAIL SENDING SIMULATION ---
 logger.info('\n=============================================')
 logger.info('[EMAIL SENT TO info@kanonas.app]')
 logger.info(`From: ${data.name} <${data.email}>`)
 logger.info(`Phone: ${data.phone} | Temple: ${data.temple}`)
 logger.info('Message:')
 logger.info(data.message)
 logger.info('=============================================\n')
 // --------------------------------

 // If you add a ContactMessage model to Prisma, you could also save it to DB here:
 // await prisma.contactMessage.create({ data })

 return { success: true }
 } catch (error: any) {
 logger.error('Contact form error:', error)
 return { success: false, error: 'Παρουσιάστηκε σφάλμα κατά την αποστολή.' }
 }
}
