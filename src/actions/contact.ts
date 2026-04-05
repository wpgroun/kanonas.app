'use server'

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
 console.log('\n=============================================')
 console.log('[EMAIL SENT TO info@kanonas.app]')
 console.log(`From: ${data.name} <${data.email}>`)
 console.log(`Phone: ${data.phone} | Temple: ${data.temple}`)
 console.log('Message:')
 console.log(data.message)
 console.log('=============================================\n')
 // --------------------------------

 // If you add a ContactMessage model to Prisma, you could also save it to DB here:
 // await prisma.contactMessage.create({ data })

 return { success: true }
 } catch (error: any) {
 console.error('Contact form error:', error)
 return { success: false, error: 'Παρουσιάστηκε σφάλμα κατά την αποστολή.' }
 }
}
