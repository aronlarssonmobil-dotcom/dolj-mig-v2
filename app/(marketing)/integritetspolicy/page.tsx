import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description:
    'Dölj Migs integritetspolicy — hur vi hanterar dina personuppgifter i enlighet med GDPR.',
  alternates: {
    canonical: 'https://dolj-mig.se/integritetspolicy',
  },
}

const sections = [
  {
    title: '1. Personuppgiftsansvarig',
    content: `Dölj Mig AB är personuppgiftsansvarig för behandlingen av dina personuppgifter. Har du frågor om hur vi hanterar dina uppgifter, kontakta oss på gdpr@dolj-mig.se.\n\nDölj Mig AB\nE-post: gdpr@dolj-mig.se`,
  },
  {
    title: '2. Vilka uppgifter samlar vi in?',
    content: `Vi samlar in och behandlar följande personuppgifter:\n\n**Kontouppgifter:** E-postadress, namn och lösenord (krypterat) som du anger vid registrering.\n\n**Skyddsuppgifter:** Namn, personnummer (valfritt), adress och stad för de personer du vill skydda. Dessa uppgifter används uteslutande för att söka efter och begära borttagning av dina uppgifter från svenska sajter.\n\n**Betalningsuppgifter:** Hanteras av Stripe. Vi lagrar inte fullständiga kortnummer — endast betalningsstatus och referensnummer.\n\n**Teknisk data:** IP-adress, webbläsartyp och operativsystem för säkerhet och felsökning.\n\n**Kommunikation:** E-postkorrespondens med vår support.`,
  },
  {
    title: '3. Varför behandlar vi dina uppgifter?',
    content: `Vi behandlar dina personuppgifter för följande ändamål:\n\n• **Fullgöra avtal (Art. 6.1.b GDPR):** Leverera tjänsten — scanna sajter, skicka GDPR-krav, bevaka resultat.\n• **Rättslig förpliktelse (Art. 6.1.c GDPR):** Bokföring och fakturering.\n• **Berättigat intresse (Art. 6.1.f GDPR):** Säkerhet, förbättring av tjänsten och kundservice.\n• **Samtycke (Art. 6.1.a GDPR):** Marknadsföringsmejl — du kan avsäga dig när som helst.`,
  },
  {
    title: '4. Hur länge sparar vi dina uppgifter?',
    content: `• **Kontouppgifter:** Så länge kontot är aktivt + 90 dagar efter avslutande.\n• **Skyddsuppgifter och scanhistorik:** Raderas 30 dagar efter att kontot avslutas.\n• **Fakturauppgifter:** 7 år i enlighet med bokföringslagen.\n• **Loggdata:** 90 dagar.`,
  },
  {
    title: '5. Delar vi dina uppgifter?',
    content: `Vi säljer aldrig dina personuppgifter. Vi delar dem enbart med:\n\n• **Supabase** (databas och autentisering) — EU-servrar.\n• **Stripe** (betalningshantering) — PCI DSS-certifierad.\n• **Resend** (e-postleverans) — för systemnotiser och rapporter.\n• **Google** (Custom Search API) — för att söka efter dina uppgifter online. Inga personuppgifter lagras av Google utöver söktermen.\n• **Vercel** (hosting) — EU-edge nodes tillgängliga.\n\nAlla leverantörer är bundna av databehandlingsavtal (DPA) i enlighet med GDPR.`,
  },
  {
    title: '6. Dina rättigheter',
    content: `Du har följande rättigheter enligt GDPR:\n\n• **Rätt till tillgång (Art. 15):** Du kan begära en kopia av alla personuppgifter vi har om dig.\n• **Rätt till rättelse (Art. 16):** Du kan korrigera felaktiga uppgifter.\n• **Rätt till radering (Art. 17):** Du kan begära att vi raderar dina uppgifter.\n• **Rätt till begränsning (Art. 18):** Du kan begära att vi begränsar behandlingen.\n• **Rätt till dataportabilitet (Art. 20):** Du kan begära dina uppgifter i maskinläsbart format.\n• **Rätt att invända (Art. 21):** Du kan invända mot behandling baserad på berättigat intresse.\n\nSkicka begäran till gdpr@dolj-mig.se. Vi svarar inom 30 dagar.`,
  },
  {
    title: '7. Cookies',
    content: `Vi använder nödvändiga cookies för autentisering (sessionshantering via Supabase). Vi använder inga spårningscookies, reklamcookies eller tredjepartscookies för analys utan ditt samtycke.`,
  },
  {
    title: '8. Säkerhet',
    content: `Vi skyddar dina uppgifter med:\n\n• Kryptering i transit (TLS 1.3) och vila (AES-256).\n• Personnummer hanteras med extra försiktighet och krypteras separat.\n• Regelbundna säkerhetsgranskningar.\n• Åtkomstkontroll — endast behörig personal når personuppgifter.`,
  },
  {
    title: '9. Klagomål',
    content: `Om du anser att vi inte hanterar dina uppgifter korrekt har du rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY):\n\nIMY\nBox 8114, 104 20 Stockholm\nimy@imy.se\nwww.imy.se`,
  },
  {
    title: '10. Ändringar',
    content: `Vi kan uppdatera denna policy. Vid väsentliga ändringar notifierar vi dig via e-post. Denna version gäller från 2025-01-01.`,
  },
]

export default function IntegritetspolicyPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-4xl mx-auto border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            D
          </div>
          <span className="font-semibold text-white">Dölj Mig</span>
        </Link>
        <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Tillbaka
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            GDPR-kompatibel
          </div>
          <h1 className="text-4xl font-semibold text-white mb-4">Integritetspolicy</h1>
          <p className="text-white/40 text-sm">
            Senast uppdaterad: 1 januari 2025
          </p>
        </div>

        <div className="bg-violet-500/[0.04] border border-violet-500/15 rounded-2xl p-5 mb-10">
          <p className="text-white/70 text-sm leading-relaxed">
            <strong className="text-white">Kort version:</strong> Vi samlar in dina uppgifter enbart
            för att leverera tjänsten — ta bort personuppgifter från internet. Vi säljer aldrig
            dina uppgifter. Du kan begära radering när som helst. Vi följer GDPR fullt ut.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-white/[0.04] pb-10">
              <h2 className="text-lg font-semibold text-white mb-4">{section.title}</h2>
              <div className="text-white/50 text-sm leading-relaxed space-y-2">
                {section.content.split('\n').map((line, i) => {
                  if (!line.trim()) return null
                  // Bold markdown
                  const parts = line.split(/(\*\*[^*]+\*\*)/g)
                  return (
                    <p key={i}>
                      {parts.map((part, j) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={j} className="text-white/80 font-medium">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
          <p className="text-white/40 text-sm mb-3">Frågor om din integritet?</p>
          <a
            href="mailto:gdpr@dolj-mig.se"
            className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            gdpr@dolj-mig.se
          </a>
        </div>
      </main>
    </div>
  )
}
