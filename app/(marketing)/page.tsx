'use client'

import { useState } from 'react'
import Link from 'next/link'

const SITES = [
  'Ratsit.se',
  'MrKoll.se',
  'Merinfo.se',
  'Hitta.se',
  'Eniro.se',
  'Birthday.se',
  'Upplysning.se',
]

const FEATURES = [
  {
    icon: '🔍',
    title: 'Automatisk scanning',
    description:
      'Vi söker igenom 7 svenska sajter och hittar var dina personuppgifter syns — namn, adress, telefon och personnummer.',
  },
  {
    icon: '📨',
    title: 'GDPR-krav på autopilot',
    description:
      'Vi skickar juridiskt korrekta borttagningskrav direkt till varje sajt. Du behöver inte göra något.',
  },
  {
    icon: '🔁',
    title: 'Löpande bevakning',
    description:
      'Varje månad scannar vi igen. Dyker dina uppgifter upp på nytt skickar vi omedelbart ett nytt krav.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Familjeskydd',
    description:
      'Skydda upp till 4 familjemedlemmar under ett och samma abonnemang. En faktura, fullt skydd.',
  },
  {
    icon: '📄',
    title: 'PDF-rapport',
    description:
      'Fullständiga skyddsrapporter varje månad. Se exakt vilka sajter vi hittat dig på och vad som gjorts.',
  },
  {
    icon: '🔐',
    title: '100% GDPR-lagligt',
    description:
      'Alla borttagningskrav skickas med stöd i Artikel 17 GDPR. Sajterna är skyldiga att svara inom 30 dagar.',
  },
]

const PLANS = [
  {
    name: 'Grundskydd',
    price: 99,
    tier: 'basic',
    features: [
      'Scanning av 7 svenska sajter',
      'Automatisk GDPR-borttagning',
      'Månatlig bevakningsscan',
      '1 skyddad person',
      'E-postnotiser',
    ],
  },
  {
    name: 'Fullständigt Skydd',
    price: 149,
    tier: 'full',
    popular: true,
    features: [
      'Allt i Grundskydd',
      'PDF-rapport varje månad',
      'Prioriterad borttagning',
      'Detaljerad aktivitetslogg',
      '1 skyddad person',
      'Prioriterad support',
    ],
  },
  {
    name: 'Familjeskydd',
    price: 249,
    tier: 'family',
    features: [
      'Allt i Fullständigt Skydd',
      'Upp till 4 skyddade personer',
      'Gemensam familjerapport',
      'Prioriterad borttagning',
      'Dedikerad support',
    ],
  },
]

const FAQ = [
  {
    q: 'Hur lång tid tar det att ta bort mina uppgifter?',
    a: 'Vi skickar GDPR-kravet direkt. Sajterna är lagligt skyldiga att svara inom 30 dagar. De flesta tar bort uppgifterna inom 1–2 veckor.',
  },
  {
    q: 'Vad händer om en sajt vägrar?',
    a: 'Om en sajt avvisar begäran utan giltig anledning hjälper vi dig att anmäla till Integritetsskyddsmyndigheten (IMY), som kan döma ut böter.',
  },
  {
    q: 'Vad behöver jag ge er?',
    a: 'Ditt namn och eventuellt personnummer och adress för att vi ska kunna hitta dig på sajternas databaser. Inget mer.',
  },
  {
    q: 'Kan sajterna lägga upp mig igen?',
    a: 'Ja, det händer ibland. Därför bevakar vi löpande varje månad och skickar nytt krav om du dyker upp igen.',
  },
  {
    q: 'Är det lagligt att göra detta?',
    a: 'Absolut. GDPR Artikel 17 ger dig rätten att bli raderad. Sajternas publicering av dina uppgifter saknar i de flesta fall rättslig grund.',
  },
  {
    q: 'Kan jag avsluta när som helst?',
    a: 'Ja. Inga bindningstider. Du kan avsluta i inställningarna när du vill. Skyddet gäller till periodens slut.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-white/90">{q}</span>
        <span className={`text-violet-400 transition-transform ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pulse-glow" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px] pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-600/6 blur-[100px] pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <span className="font-semibold text-white">Dölj Mig</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#hur-det-fungerar" className="hover:text-white transition-colors">
            Hur det fungerar
          </a>
          <a href="#priser" className="hover:text-white transition-colors">
            Priser
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
          >
            Logga in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            Kom igång
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-glow inline-block" />
          GDPR-skydd som faktiskt fungerar
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-8">
          <span className="text-white">Dölj dina</span>
          <br />
          <span className="italic gradient-text">uppgifter online</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Vi hittar var ditt namn, adress och personnummer syns på svenska sajter
          och skickar juridiskt bindande krav om borttagning — på autopilot.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02]"
          >
            Starta skyddet — 99 kr/mån →
          </Link>
          <a
            href="#hur-det-fungerar"
            className="w-full sm:w-auto text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl font-medium text-base transition-all"
          >
            Se hur det fungerar
          </a>
        </div>

        {/* Site logos strip */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-white/30 text-sm mr-2">Skyddar mot:</span>
          {SITES.map((site) => (
            <span
              key={site}
              className="text-xs text-white/40 border border-white/10 rounded-md px-3 py-1.5 bg-white/[0.02]"
            >
              {site}
            </span>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '7', label: 'Svenska sajter' },
            { n: '30 dagar', label: 'Legal svarstid för sajter' },
            { n: '100%', label: 'GDPR-baserat' },
            { n: '24/7', label: 'Automatisk bevakning' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl md:text-4xl text-white mb-1 italic">{s.n}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hur-det-fungerar" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Tre steg till{' '}
            <span className="italic gradient-text">full integritet</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Från registrering till skyddad — på under 5 minuter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Registrera dig',
              desc: 'Skapa ett konto och ange din information — namn, eventuellt personnummer och adress.',
            },
            {
              step: '02',
              title: 'Vi scannar',
              desc: 'Vi söker igenom 7 svenska sajter och listar exakt var dina uppgifter finns.',
            },
            {
              step: '03',
              title: 'Vi tar bort',
              desc: 'Vi skickar GDPR-krav till varje sajt och bevakar att de faktiskt tar bort dem.',
            },
          ].map((s) => (
            <div
              key={s.step}
              className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] group hover:border-violet-500/30 transition-colors"
            >
              <div className="text-6xl font-serif italic text-violet-500/20 mb-4 group-hover:text-violet-500/30 transition-colors">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Allt du behöver för{' '}
            <span className="italic gradient-text">integritetsskydd</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-12">
            <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
              Vad våra kunder säger
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'Inom 2 veckor var mina uppgifter borta från Ratsit, Hitta.se och Eniro. Äntligen.',
                author: 'Sara L.',
                role: 'Grundskydd',
              },
              {
                quote:
                  'Jag är journalist och har känsliga uppgifter. Dölj Mig håller koll åt mig hela tiden.',
                author: 'Marcus T.',
                role: 'Fullständigt Skydd',
              },
              {
                quote:
                  'Familjeplanen är guld värd. Hela familjen skyddad utan att behöva hålla koll själv.',
                author: 'Karin M.',
                role: 'Familjeskydd',
              },
            ].map((t) => (
              <div
                key={t.author}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-medium text-white text-sm">{t.author}</div>
                  <div className="text-white/40 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="priser" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Enkla{' '}
            <span className="italic gradient-text">priser</span>
          </h2>
          <p className="text-white/50 text-lg">
            Ingen bindningstid. Avsluta när du vill.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.popular
                  ? 'border-violet-500/50 bg-violet-500/[0.04] glow-violet'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Populärast
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm">kr/mån</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/register?plan=${plan.tier}`}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20'
                    : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/[0.04]'
                }`}
              >
                Välj {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          Alla priser inkl. moms · Betalning via Stripe · Avsluta när som helst
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Vanliga{' '}
            <span className="italic gradient-text">frågor</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pb-32">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 relative z-10">
            Ta tillbaka din{' '}
            <span className="italic gradient-text">integritet</span>
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto relative z-10">
            Börja idag. Inga bindningstider, inga krångliga formulär.
            Vi sköter allt åt dig.
          </p>
          <Link
            href="/register"
            className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-500/30 hover:scale-[1.02]"
          >
            Starta skyddet nu →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              D
            </div>
            <span className="text-white/40 text-sm">Dölj Mig</span>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <a href="/privacy" className="hover:text-white/60 transition-colors">
              Integritetspolicy
            </a>
            <a href="/terms" className="hover:text-white/60 transition-colors">
              Villkor
            </a>
            <a href="mailto:hej@dolj-mig.se" className="hover:text-white/60 transition-colors">
              Kontakt
            </a>
          </div>
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Dölj Mig. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  )
}
