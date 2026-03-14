import { SupportedSite, SITE_GDPR_EMAILS, SITE_DISPLAY_NAMES } from '@/types'
import { sendEmail } from './resend'

export interface GDPREmailPayload {
  personName: string
  personPnr?: string | null
  personAddress?: string | null
  profileUrl: string
  site: SupportedSite
  senderEmail: string // the customer's email (for reply-to reference)
}

function getGDPREmailContent(payload: GDPREmailPayload): {
  subject: string
  html: string
  text: string
} {
  const { personName, personPnr, personAddress, profileUrl, site } = payload
  const siteName = SITE_DISPLAY_NAMES[site]
  const subject = `Begäran om radering av personuppgifter – ${personName}`

  const pnrLine = personPnr
    ? `<p><strong>Personnummer:</strong> ${personPnr}</p>`
    : ''
  const addressLine = personAddress
    ? `<p><strong>Adress:</strong> ${personAddress}</p>`
    : ''
  const pnrText = personPnr ? `Personnummer: ${personPnr}\n` : ''
  const addressText = personAddress ? `Adress: ${personAddress}\n` : ''

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; }
    h2 { color: #111; }
    .info-box { background: #f5f5f5; border-left: 4px solid #6366f1; padding: 16px; margin: 16px 0; }
    a { color: #6366f1; }
    .legal { font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
<div class="container">
  <h2>Begäran om radering av personuppgifter</h2>

  <p>Till dataskyddsansvarig hos ${siteName},</p>

  <p>
    Jag skriver till er för att utöva min rätt till radering av personuppgifter enligt
    <strong>Artikel 17 i Dataskyddsförordningen (GDPR)</strong> samt
    <strong>Dataskyddslagen (2018:218)</strong>.
  </p>

  <p>Jag begär att följande uppgifter omedelbart raderas från er tjänst:</p>

  <div class="info-box">
    <p><strong>Personuppgifter som ska raderas:</strong></p>
    <p><strong>Namn:</strong> ${personName}</p>
    ${pnrLine}
    ${addressLine}
    <p><strong>Profil-URL:</strong> <a href="${profileUrl}">${profileUrl}</a></p>
  </div>

  <p>
    Jag har inte gett mitt samtycke till att mina personuppgifter behandlas eller publiceras
    på er plattform. Det finns inget berättigat intresse som väger tyngre än min grundläggande
    rätt till privatliv (GDPR Art. 7, 17 och 21).
  </p>

  <p>
    Ni är enligt GDPR skyldiga att besvara denna begäran <strong>inom 30 dagar</strong>.
    Om ni avser att avvisa begäran ber jag er att ange de rättsliga grunderna för detta
    skriftligen.
  </p>

  <p>
    Underlåtenhet att efterleva denna begäran kan leda till anmälan till
    <strong>Integritetsskyddsmyndigheten (IMY)</strong>.
  </p>

  <p>Med vänliga hälsningar,<br/><strong>${personName}</strong></p>

  <div class="legal">
    <p>
      Detta meddelande skickas via <strong>Dölj Mig</strong> — en GDPR-skyddstjänst.
      Dölj Mig agerar som personuppgiftsbiträde åt den registrerade och har
      fullmakt att skicka denna begäran å dennes vägnar.
    </p>
  </div>
</div>
</body>
</html>`

  const text = `Begäran om radering av personuppgifter
Till: ${siteName}

Jag begär radering av mina personuppgifter enligt GDPR Artikel 17.

Uppgifter att radera:
Namn: ${personName}
${pnrText}${addressText}Profil-URL: ${profileUrl}

Enligt GDPR ska ni besvara denna begäran inom 30 dagar.
Underlåtenhet kan leda till anmälan till IMY.

Med vänliga hälsningar,
${personName}

---
Skickat via Dölj Mig (dolj-mig.se)`

  return { subject, html, text }
}

/**
 * Send a GDPR takedown email to a site's data protection contact
 */
export async function sendGDPREmail(payload: GDPREmailPayload): Promise<{ id?: string }> {
  const contactEmail = SITE_GDPR_EMAILS[payload.site]
  const { subject, html, text } = getGDPREmailContent(payload)

  const result = await sendEmail({
    to: contactEmail,
    subject,
    html,
    text,
    replyTo: payload.senderEmail,
  })

  return result.data || {}
}

/**
 * Send a confirmation email to the customer that a takedown was sent
 */
export async function sendTakedownConfirmationEmail(
  customerEmail: string,
  personName: string,
  site: SupportedSite,
  profileUrl: string
): Promise<void> {
  const siteName = SITE_DISPLAY_NAMES[site]
  const contactEmail = SITE_GDPR_EMAILS[site]

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; }
    .badge { display: inline-block; background: #6366f1; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; }
    .info-box { background: #f0f0ff; border: 1px solid #6366f1; padding: 16px; border-radius: 8px; margin: 16px 0; }
    a { color: #6366f1; }
  </style>
</head>
<body>
<div class="container">
  <p><span class="badge">✓ GDPR-krav skickat</span></p>
  <h2>Vi har skickat borttagningskravet</h2>

  <p>Hej,</p>
  <p>
    Vi har nu skickat ett GDPR-borttagningskrav till <strong>${siteName}</strong>
    för att få bort uppgifter om <strong>${personName}</strong>.
  </p>

  <div class="info-box">
    <p><strong>Sajt:</strong> ${siteName}</p>
    <p><strong>Profil:</strong> <a href="${profileUrl}">${profileUrl}</a></p>
    <p><strong>Skickat till:</strong> ${contactEmail}</p>
    <p><strong>Svarstid:</strong> Upp till 30 dagar (GDPR-krav)</p>
  </div>

  <p>
    Vi bevakar ärendet och meddelar dig om sajten bekräftar eller avvisar begäran.
    Du kan följa statusen i din <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">instrumentpanel</a>.
  </p>

  <p>Med vänliga hälsningar,<br/>Teamet på Dölj Mig</p>
</div>
</body>
</html>`

  await sendEmail({
    to: customerEmail,
    subject: `GDPR-krav skickat till ${siteName}`,
    html,
  })
}

/**
 * Send monthly scan report notification email
 */
export async function sendMonthlyReportEmail(
  customerEmail: string,
  customerName: string | null,
  month: string,
  stats: {
    personsScanned: number
    newFindings: number
    takedownsSent: number
    takedownsCompleted: number
  },
  pdfUrl?: string | null
): Promise<void> {
  const greeting = customerName ? `Hej ${customerName.split(' ')[0]}` : 'Hej'
  const monthFormatted = new Date(month + '-01').toLocaleString('sv-SE', {
    month: 'long',
    year: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; background: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 8px 0 0; opacity: 0.85; }
    .body { padding: 24px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .stat { background: #f5f5ff; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: 700; color: #6366f1; }
    .stat-label { font-size: 12px; color: #666; }
    .cta { display: block; background: #6366f1; color: white; text-align: center; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .footer { padding: 16px 24px; background: #f5f5f5; font-size: 12px; color: #888; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🛡️ Din månadsrapport</h1>
    <p>${monthFormatted} — Dölj Mig</p>
  </div>
  <div class="body">
    <p>${greeting},</p>
    <p>Här är din skyddssammanfattning för <strong>${monthFormatted}</strong>:</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-number">${stats.personsScanned}</div>
        <div class="stat-label">Skannade personer</div>
      </div>
      <div class="stat">
        <div class="stat-number">${stats.newFindings}</div>
        <div class="stat-label">Nya fynd</div>
      </div>
      <div class="stat">
        <div class="stat-number">${stats.takedownsSent}</div>
        <div class="stat-label">Borttagningskrav skickade</div>
      </div>
      <div class="stat">
        <div class="stat-number">${stats.takedownsCompleted}</div>
        <div class="stat-label">Bekräftade borttagningar</div>
      </div>
    </div>

    ${pdfUrl ? `<a href="${pdfUrl}" class="cta">📄 Ladda ner PDF-rapport</a>` : ''}
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta" style="${pdfUrl ? 'background: #111;' : ''}">Öppna instrumentpanel</a>

    <p>Tack för att du använder Dölj Mig. Vi håller koll åt dig.</p>
    <p>Teamet på Dölj Mig</p>
  </div>
  <div class="footer">
    Du får detta mail för att du är prenumerant på Dölj Mig.
    Hantera dina inställningar i <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">inställningar</a>.
  </div>
</div>
</body>
</html>`

  await sendEmail({
    to: customerEmail,
    subject: `Din skyddsrapport för ${monthFormatted} — Dölj Mig`,
    html,
  })
}
