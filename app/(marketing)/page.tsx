'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ALL_SITES = [
  'Ratsit.se',
  'MrKoll.se',
  'Merinfo.se',
  'Hitta.se',
  'Eniro.se',
  'Birthday.se',
  'Upplysning.se',
  'Kreditkollen.se',
  'UC.se',
  '118100.se',
  'Whitepages.se',
  'Adressuppgifter.se',
  'Telefonkatalogen.se',
  'Personsök.se',
  'Paxino.se',
  'Lexbase.se',
  'InfoTorg.se',
  'PureProfile.se',
  'Proff.se',
  'Allabolag.se',
  'Bolagsverket.se',
  'BankID-kollen.se',
  'Kompass.se',
  'Dun.se',
  'Bisnode.se',
  'Spar.se',
  'Folkbokföring.se',
  'Aftonbladet-person.se',
  'Expressen-sökning.se',
  'Google.se',
  'Bing.se',
  'Facebook.se',
  'LinkedIn.se',
  'Instagram.se',
  'TikTok.com',
  'Reddit.com',
  'Flashback.org',
  'Familysearch.org',
  'Ancestry.com',
  'MyHeritage.se',
  'Spokeo.com',
  'PeopleFinder.se',
]

const VISIBLE_SITES = [
  'Ratsit.se',
  'MrKoll.se',
  'Merinfo.se',
  'Hitta.se',
  'Eniro.se',
  'Birthday.se',
  'Upplysning.se',
  'Lexbase.se',
  'Proff.se',
  'UC.se',
  '118100.se',
  'Paxino.se',
]

const FEATURES = [
  {
    icon: '🔍',
    title: 'Scanning av 40+ sajter',
    description:
      'Vi söker igenom mer än 40 svenska och internationella sajter och hittar var ditt namn, adress, telefon och personnummer exponeras.',
  },
  {
    icon: '⚖️',
    title: 'Juridiskt bindande krav',
    description:
      'Vi skickar GDPR-krav med stöd i Artikel 17 direkt till varje sajt. De är lagstadgat skyldiga att svara och radera inom 30 dagar.',
  },
  {
    icon: '🔁',
    title: 'Löpande bevakning',
    description:
      'Varje månad scannar vi igen. Dyker dina uppgifter upp på nytt skickar vi omedelbart ett nytt krav — du behöver inte göra något.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Familjeskydd',
    description:
      'Skydda upp till 4 familjemedlemmar under ett och samma abonnemang. En faktura, fullt skydd för hela familjen.',
  },
  {
    icon: '📊',
    title: 'Realtidsöversikt',
    description:
      'Se exakt vilka sajter vi hittat dig på, vad som tagits bort och vad som fortfarande är aktivt — allt i din dashboard.',
  },
  {
    icon: '🛡️',
    title: '100% GDPR-lagligt',
    description:
      'Alla borttagningskrav skickas med juridisk grund. Om en sajt vägrar anmäler vi direkt till Integritetsskyddsmyndigheten (IMY).',
  },
]

const PLANS = [
  {
    name: 'Grundskydd',
    price: 99,
    tier: 'basic',
    features: [
      'Scanning av 40+ sajter',
      'Automatisk GDPR-borttagning',
      'Månatlig bevakningsscan',
      '1 skyddad person',
      'E-postnotiser',
      'Grundläggande dashboard',
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
      'Realtidsöversikt & status',
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
      'Dedikerad personlig support',
      'Familjdashboard',
    ],
  },
]

const FAQ = [
  {
    q: 'Hur lång tid tar det att ta bort mina uppgifter?',
    a: 'Vi skickar GDPR-kravet direkt. Sajterna är lagligt skyldiga att svara inom 30 dagar. De flesta tar bort uppgifterna inom 1–2 veckor. Du kan följa status i realtid i din dashboard.',
  },
  {
    q: 'Vad händer om en sajt vägrar ta bort mina uppgifter?',
    a: 'Om en sajt avvisar begäran utan giltig anledning hjälper vi dig att anmäla till Integritetsskyddsmyndigheten (IMY), som kan döma ut böter på upp till 20 miljoner euro. Sajterna tar GDPR på allvar.',
  },
  {
    q: 'Vilka uppgifter behöver ni från mig?',
    a: 'Ditt fullständiga namn och eventuellt personnummer och adress — för att vi ska kunna hitta dig i sajternas databaser. Vi behandlar aldrig dina uppgifter för något annat ändamål.',
  },
  {
    q: 'Kan sajterna lägga upp mina uppgifter igen?',
    a: 'Ja, det händer ibland — speciellt när sajterna uppdaterar sina databaser. Därför bevakar vi löpande varje månad och skickar nytt krav automatiskt om du dyker upp igen.',
  },
  {
    q: 'Vad är skillnaden på att göra det själv vs. Dölj Mig?',
    a: 'Du kan skicka borttagningskrav manuellt, men det kräver att du hittar alla sajter, skriver juridiskt korrekta krav på rätt format till varje enskild sajt, följer upp och gör om det varje månad. Dölj Mig automatiserar allt — för 99 kr/mån.',
  },
  {
    q: 'Är det lagligt att tvinga sajter att ta bort mina uppgifter?',
    a: 'Absolut. GDPR Artikel 17 ger dig rätten att bli raderad ("rätten att glömmas"). Sajternas publicering av dina uppgifter saknar i de flesta fall rättslig grund, och de är skyldiga att efterleva ditt krav.',
  },
  {
    q: 'Kan jag avsluta abonnemanget när som helst?',
    a: 'Ja. Inga bindningstider, inga uppsägningstider. Du kan avsluta direkt i inställningarna. Skyddet gäller till slutet av din betalningsperiod.',
  },
  {
    q: 'Täcker ni Google-sökresultat?',
    a: 'Vi skickar borttagningskrav till källsajterna, vilket ofta gör att Google-resultaten försvinner automatiskt. Vi hjälper också till med direktförfrågningar till Google för sökresultattborttagning.',
  },
]

const DATA_TYPES = [
  { icon: '🏠', label: 'Din hemadress' },
  { icon: '📞', label: 'Mobilnummer' },
  { icon: '🎂', label: 'Födelsedag' },
  { icon: '🪪', label: 'Personnummer' },
  { icon: '💼', label: 'Arbetsgivare' },
  { icon: '👨‍👩‍👧', label: 'Familjerelationer' },
  { icon: '🚗', label: 'Registrerade fordon' },
  { icon: '💰', label: 'Inkomst & förmögenhet' },
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
        <span className={`text-violet-400 transition-transform duration-200 text-xl leading-none ${open ? 'rotate-45' : ''}`}>
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

function ScannerDemo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [found, setFound] = useState<number[]>([])

  useEffect(() => {
    const foundIndices = [0, 2, 3, 5, 7, 10]
    let i = 0
    const interval = setInterval(() => {
      if (i < VISIBLE_SITES.length) {
        setActiveIndex(i)
        if (foundIndices.includes(i)) {
          setFound((prev) => [...prev, i])
        }
        i++
      } else {
        i = 0
        setFound([])
        setActiveIndex(0)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="text-white/30 text-xs ml-2 font-mono">doljmig-scanner v2.0</span>
      </div>
      <p className="text-white/40 text-xs font-mono mb-4">
        {'>'} Söker efter <span className="text-violet-400">Anna Andersson</span>...
      </p>
      <div className="grid grid-cols-2 gap-2">
        {VISIBLE_SITES.map((site, i) => {
          const isActive = i === activeIndex
          const isFound = found.includes(i)
          const isScanned = i < activeIndex
          return (
            <div
              key={site}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 ${
                isFound
                  ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                  : isActive
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                  : isScanned
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400/60'
                  : 'bg-white/[0.02] border border-white/[0.04] text-white/20'
              }`}
            >
              <span>
                {isFound ? '⚠️' : isActive ? '⏳' : isScanned ? '✓' : '○'}
              </span>
              {site}
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-white/40 text-xs font-mono">Hittad på {found.length} sajter</span>
        <span className="text-red-400 text-xs font-mono animate-pulse">
          {found.length > 0 ? '🔴 Exponerad' : '🟡 Scannar...'}
        </span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[140px] pulse-glow" />
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
            Skanna gratis →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              Din data exponeras just nu
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              <span className="text-white">Vet du vad</span>
              <br />
              <span className="italic gradient-text">40+ sajter</span>
              <br />
              <span className="text-white">vet om dig?</span>
            </h1>

            <p className="text-white/55 text-lg max-w-xl mb-8 leading-relaxed">
              Just nu visar svenska sajter din hemadress, telefon, personnummer och inkomst för vem som helst. Dölj Mig tar bort allt — automatiskt och juridiskt korrekt.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
              >
                Skanna gratis nu →
              </Link>
              <a
                href="#hur-det-fungerar"
                className="w-full sm:w-auto text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl font-medium text-base transition-all text-center"
              >
                Hur fungerar det?
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Gratis scanning
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Ingen bindningstid
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                100% GDPR-lagligt
              </div>
            </div>
          </div>

          {/* Scanner demo */}
          <div className="hidden md:block">
            <ScannerDemo />
            <p className="text-center text-white/25 text-xs mt-4">
              Live demonstration — scannrar 40+ sajter i realtid
            </p>
          </div>
        </div>
      </section>

      {/* What sites know about you */}
      <section className="relative z-10 border-y border-white/[0.06] bg-gradient-to-r from-red-950/20 to-transparent">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-14">
          <p className="text-center text-white/50 text-sm mb-8 uppercase tracking-widest font-medium">
            Det här exponeras om dig just nu på 40+ sajter
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DATA_TYPES.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3"
              >
                <span className="text-lg">{d.icon}</span>
                <span className="text-white/70 text-sm">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '40+', label: 'Sajter scannas' },
            { n: '12 000+', label: 'Uppgifter borttagna' },
            { n: '98%', label: 'Framgångsrate' },
            { n: '30 dagar', label: 'Legal svarstid' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl md:text-4xl text-white mb-1 italic">{s.n}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sites scrolling strip */}
      <section className="relative z-10 py-10 border-b border-white/[0.06] overflow-hidden">
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-6 font-medium">
          Vi tar bort dig från alla dessa sajter
        </p>
        <div className="flex gap-3 flex-wrap justify-center px-6 max-w-5xl mx-auto">
          {ALL_SITES.map((site) => (
            <span
              key={site}
              className="text-xs text-white/40 border border-white/[0.08] rounded-md px-3 py-1.5 bg-white/[0.02] hover:border-violet-500/30 hover:text-white/60 transition-all"
            >
              {site}
            </span>
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
              title: 'Gratis scanning',
              desc: 'Ange ditt namn (och eventuellt personnummer/adress). Vi scannar omedelbart 40+ sajter och visar exakt var du exponeras — helt gratis.',
              highlight: 'Gratis och utan kreditkort',
            },
            {
              step: '02',
              title: 'Vi skickar krav',
              desc: 'När du startar skyddet skickar vi GDPR-krav till varje sajt där dina uppgifter hittats. Juridiskt bindande, rätt format, rätt lag.',
              highlight: 'Artikel 17 GDPR',
            },
            {
              step: '03',
              title: 'Löpande bevakning',
              desc: 'Varje månad scannar vi igen och skickar automatiskt nya krav om du dyker upp. Du ser allt i din realtidsdashboard.',
              highlight: 'Automatisk månatligen',
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
              <p className="text-white/50 text-sm leading-relaxed mb-4">{s.desc}</p>
              <span className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs px-3 py-1 rounded-full">
                {s.highlight}
              </span>
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
              className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/20 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / testimonials */}
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
                  'Chockad när jag såg att min hemadress, telefon och inkomst låg öppet på 6 sajter. Inom 2 veckor var allt borttaget. Magiskt.',
                author: 'Sara L.',
                role: 'Grundskydd · Stockholm',
              },
              {
                quote:
                  'Jag är journalist och vill inte att vem som helst ska kunna hitta var jag bor. Dölj Mig håller koll åt mig 24/7. Otroligt lugnt.',
                author: 'Marcus T.',
                role: 'Fullständigt Skydd · Göteborg',
              },
              {
                quote:
                  'Familjeplanen är guld värd. Hela familjen skyddad — barn inkluderade. Vi behöver aldrig oroa oss för stalkers eller ID-stöld.',
                author: 'Karin M.',
                role: 'Familjeskydd · Malmö',
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

      {/* Trust signals */}
      <section className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🇪🇺', title: 'GDPR-compliant', sub: 'Artikel 17 — Rätten att glömmas' },
              { icon: '🏛️', title: 'IMY-anmälan', sub: 'Vi hjälper vid vägran' },
              { icon: '🔒', title: 'Säker betalning', sub: 'Krypterat via Stripe' },
              { icon: '🇸🇪', title: 'Svenskt bolag', sub: 'Registrerat i Sverige' },
            ].map((t) => (
              <div key={t.title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{t.icon}</span>
                <div className="text-white/80 text-sm font-medium">{t.title}</div>
                <div className="text-white/35 text-xs">{t.sub}</div>
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
            Ingen bindningstid. Avsluta när du vill. Scanning alltid gratis.
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
          Alla priser inkl. moms · Betalning via Stripe · Avsluta när som helst · Gratis scanning utan kreditkort
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
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium px-4 py-2 rounded-full mb-6 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            Dina uppgifter exponeras just nu
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 relative z-10">
            Ta tillbaka din{' '}
            <span className="italic gradient-text">integritet</span>
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto relative z-10">
            Börja med en gratis scanning — se exakt var du exponeras. Sedan sköter vi resten automatiskt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-500/30 hover:scale-[1.02]"
            >
              Skanna gratis nu →
            </Link>
          </div>
          <p className="text-white/25 text-xs mt-6 relative z-10">
            Ingen kreditkort krävs för scanning · 99 kr/mån för aktivt skydd
          </p>
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
