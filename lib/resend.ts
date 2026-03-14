import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

export const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@dolj-mig.se'
export const FROM_NAME = 'Dölj Mig'
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}) {
  const result = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    replyTo: replyTo,
  })

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }

  return result
}
