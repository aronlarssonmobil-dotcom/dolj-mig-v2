'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  'Flashback.org',
  'Familysearch.org',
  'Ancestry.com',
  'MyHeritage.se',
  'Spokeo.com',
  'PeopleFinder.se',
  'Mrkoll.se',
  'Koll.se',
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

const FAQ_ITEMS = [
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

const COMPARISON_ROWS = [
  { label: 'Automatisk borttagning', others: false, us: true },
  { label: 'Juridiskt korrekta GDPR-krav', others: false, us: true },
  { label: 'Täcker 40+ sajter', others: false, us: true },
  { label: 'Löpande månatlig bevakning', others: false, us: true },
  { label: 'Realtidsdashboard', others: false, us: true },
  { label: 'IMY-anmälan vid vägran', others: false, us: true },
  { label: 'Familjeskydd (upp till 4 pers)', others: false, us: true },
  { label: 'Ingen bindningstid', others: false, us: true },
]

const TESTIMONIALS = [
  {
    quote:
      'Chockad när jag såg att min hemadress, telefon och inkomst låg öppet på 6 sajter. Inom 2 veckor var allt borttaget. Magiskt.',
    author: 'Sara L.',
    role: 'Grundskydd · Stockholm',
    stars: 5,
  },
  {
    quote:
      'Jag är journalist och vill inte att vem som helst ska kunna hitta var jag bor. Dölj Mig håller koll åt mig 24/7. Otroligt lugnt.',
    author: 'Marcus T.',
    role: 'Fullständigt Skydd · Göteborg',
    stars: 5,
  },
  {
    quote:
      'Familjeplanen är guld värd. Hela familjen skyddad — barn inkluderade. Vi behöver aldrig oroa oss för stalkers eller ID-stöld.',
    author: 'Karin M.',
    role: 'Familjeskydd · Malmö',
    stars: 5,
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden transition-colors hover:border-white/[0.12]">
      <button
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-medium text-white/90 pr-4">{q}</span>
        <span
          className={`text-violet-400 transition-transform duration-300 text-2xl leading-none flex-shrink-0 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div ref={contentRef} style={{ overflow: 'hidden' }}>
          <div className="px-6 pb-5 text-white/55 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
            {a}
          </div>
        </div>
      </div>
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
    }, 420)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-sm p-6 max-w-md mx-auto shadow-2xl shadow-violet-900/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="text-white/25 text-xs ml-2 font-mono">doljmig-scanner v2.0</span>
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
              <span>{isFound ? '⚠️' : isActive ? '⏳' : isScanned ? '✓' : '○'}</span>
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

function HeroForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [pnr, setPnr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const params = new URLSearchParams()
    if (name) params.set('name', name)
    if (pnr) params.set('pnr', pnr)
    router.push(`/register?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="bg-black/40 border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
        <div className="space-y-1.5 mb-1.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt fullständiga namn"
            required
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
          />
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="Personnummer (valfritt) — xxxxxx-xxxx"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.01]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scannar...
            </span>
          ) : (
            '🔍 Skanna mig gratis nu →'
          )}
        </button>
      </div>
      <p className="text-white/25 text-xs mt-3 text-center">
        Gratis scanning · Inget kreditkort krävs · 100% GDPR-säkert
      </p>
    </form>
  )
}

function SiteTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)
  // Duplicate sites for seamless infinite scroll
  const doubled = [...ALL_SITES, ...ALL_SITES]

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />

      <div
        ref={tickerRef}
        className="flex gap-3 whitespace-nowrap"
        style={{
          animation: 'ticker-scroll 40s linear infinite',
        }}
      >
        {doubled.map((site, i) => (
          <span
            key={`${site}-${i}`}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 border border-white/[0.08] rounded-full px-4 py-2 bg-white/[0.02] flex-shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 inline-block" />
            {site}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://dolj-mig.se/#organization',
      name: 'Dölj Mig',
      url: 'https://dolj-mig.se',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dolj-mig.se/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hej@dolj-mig.se',
        contactType: 'customer support',
        availableLanguage: 'Swedish',
      },
      sameAs: [],
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://dolj-mig.se/#webapp',
      name: 'Dölj Mig',
      url: 'https://dolj-mig.se',
      description:
        'Automatisk borttagning av personuppgifter från över 40 svenska sajter via GDPR Artikel 17.',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Web',
      offers: [
        {
          '@type': 'Offer',
          name: 'Grundskydd',
          price: '99',
          priceCurrency: 'SEK',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Fullständigt Skydd',
          price: '149',
          priceCurrency: 'SEK',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Familjeskydd',
          price: '249',
          priceCurrency: 'SEK',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
      ],
      publisher: {
        '@id': 'https://dolj-mig.se/#organization',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://dolj-mig.se/#faq',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    },
    {
      '@type': 'WebSite',
      '@id': 'https://dolj-mig.se/#website',
      url: 'https://dolj-mig.se',
      name: 'Dölj Mig',
      publisher: {
        '@id': 'https://dolj-mig.se/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://dolj-mig.se/register?name={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* JSON-LD Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .pulse-glow {
          animation: pulse-glow 6s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd);
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-violet {
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.15), inset 0 0 40px rgba(139, 92, 246, 0.03);
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up {
          animation: float-up 0.6s ease forwards;
        }
        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[140px] pulse-glow" />
        <div
          className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px] pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[100px] pulse-glow"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/30">
            D
          </div>
          <span className="font-semibold text-white">Dölj Mig</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#hur-det-fungerar" className="hover:text-white transition-colors">
            Hur det fungerar
          </a>
          <a href="#jamforelse" className="hover:text-white transition-colors">
            Jämförelse
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
            className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 hidden sm:block"
          >
            Logga in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            Skanna gratis →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy + form */}
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              Din data exponeras just nu — på 40+ sajter
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-[3.8rem] xl:text-[4.5rem] leading-[1.05] mb-6">
              <span className="text-white">Vet du vad</span>
              <br />
              <span className="italic gradient-text">40+ sajter</span>
              <br />
              <span className="text-white">vet om dig just nu?</span>
            </h1>

            <p className="text-white/55 text-lg max-w-lg mb-10 leading-relaxed">
              Ditt namn, adress, inkomst och familj finns på Ratsit, MrKoll, Hitta och 37 sajter
              till — synliga för vem som helst. Vi tar bort allt, juridiskt och automatiskt.
            </p>

            {/* ★ THE HERO FORM ★ */}
            <HeroForm />

            {/* Social proof micro */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                {['S', 'M', 'K', 'J'].map((l, i) => (
                  <div
                    key={l}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 border-2 border-[#080808] flex items-center justify-center text-xs font-bold text-white/90"
                    style={{ zIndex: 4 - i }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="text-white/40 text-sm">
                <span className="text-yellow-400">★★★★★</span>
                <span className="ml-2">500+ skyddade sedan igår</span>
              </div>
            </div>
          </div>

          {/* Right: scanner */}
          <div className="hidden lg:block">
            <ScannerDemo />
            <p className="text-center text-white/20 text-xs mt-4">
              Live demonstration — scannar 40+ sajter i realtid
            </p>
          </div>
        </div>
      </section>

      {/* ─── SITE TICKER ─── */}
      <section className="relative z-10 py-8 border-y border-white/[0.05] bg-black/20 overflow-hidden">
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-6 font-medium">
          Vi tar bort dig från alla dessa sajter
        </p>
        <SiteTicker />
      </section>

      {/* ─── WHAT THEY KNOW ─── */}
      <section className="relative z-10 border-b border-white/[0.05] bg-gradient-to-r from-red-950/15 to-transparent">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-14">
          <p className="text-center text-white/45 text-sm mb-8 uppercase tracking-widest font-medium">
            Det här exponeras om dig just nu
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DATA_TYPES.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3.5 hover:bg-red-500/10 transition-colors"
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-white/70 text-sm">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 border-b border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '40+', label: 'Sajter scannas' },
            { n: '12 000+', label: 'Uppgifter borttagna' },
            { n: '98%', label: 'Framgångsrate' },
            { n: '30 dagar', label: 'Legal svarstid' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl md:text-4xl text-white mb-1 italic gradient-text">
                {s.n}
              </div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="hur-det-fungerar" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32">
        <div className="text-center mb-16">
          <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
            Så enkelt är det
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Tre steg till{' '}
            <span className="italic gradient-text">full integritet</span>
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Från registrering till skyddad — på under 5 minuter.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Skanna',
                desc: 'Ange ditt namn och personnummer. Vi söker igenom 40+ sajter och visar exakt var du exponeras — gratis, utan kreditkort.',
                highlight: 'Gratis · Inga krav',
              },
              {
                step: '02',
                icon: '⚖️',
                title: 'GDPR-borttagning',
                desc: 'Vi skickar juridiskt bindande borttagningskrav till varje sajt med stöd i GDPR Artikel 17. De är skyldiga att svara inom 30 dagar.',
                highlight: 'Juridiskt korrekt',
              },
              {
                step: '03',
                icon: '🔁',
                title: 'Bevakning',
                desc: 'Varje månad scannar vi igen och skickar automatiskt nya krav om du dyker upp. Du ser allt live i din dashboard.',
                highlight: 'Automatisk · Alltid på',
              },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] group hover:border-violet-500/30 hover:bg-white/[0.035] transition-all"
              >
                <div className="absolute -top-4 left-8 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {s.step}
                </div>
                <div className="text-3xl mb-5 mt-2">{s.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{s.desc}</p>
                <span className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs px-3 py-1.5 rounded-full">
                  {s.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-16">
          <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
            Vad du får
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Allt du behöver för{' '}
            <span className="italic gradient-text">integritetsskydd</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/25 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-3xl mb-5">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2.5">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section id="jamforelse" className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-14">
          <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
            Varför Dölj Mig?
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Vi är inte som{' '}
            <span className="italic gradient-text">andra tjänster</span>
          </h2>
          <p className="text-white/45 text-base max-w-lg mx-auto">
            Andra tjänster ger dig manuella instruktioner. Vi gör jobbet åt dig — automatiskt och
            juridiskt korrekt.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/[0.07]">
            <div className="px-6 py-4 text-white/40 text-sm font-medium">Funktion</div>
            <div className="px-6 py-4 text-white/50 text-sm font-medium text-center border-l border-white/[0.07]">
              Andra tjänster
            </div>
            <div className="px-6 py-4 text-violet-300 text-sm font-semibold text-center border-l border-violet-500/20 bg-violet-500/[0.04]">
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  D
                </span>
                Dölj Mig
              </span>
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 border-b border-white/[0.05] last:border-b-0 ${
                i % 2 === 0 ? '' : 'bg-white/[0.01]'
              }`}
            >
              <div className="px-6 py-4 text-white/70 text-sm">{row.label}</div>
              <div className="px-6 py-4 text-center border-l border-white/[0.05]">
                <span className="text-red-400 text-lg">❌</span>
              </div>
              <div className="px-6 py-4 text-center border-l border-violet-500/10 bg-violet-500/[0.02]">
                <span className="text-green-400 text-lg">✅</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:scale-[1.02]"
          >
            Börja med gratis scanning →
          </Link>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="relative z-10 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-14">
            <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
              Vad våra kunder säger
            </p>
            <h2 className="font-serif text-4xl text-white">
              Riktiga människor,{' '}
              <span className="italic gradient-text">riktiga resultat</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/20 transition-all"
              >
                <div className="flex mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{t.author}</div>
                    <div className="text-white/35 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS ─── */}
      <section className="relative z-10 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🇪🇺', title: 'GDPR-compliant', sub: 'Artikel 17 — Rätten att glömmas' },
              { icon: '🏛️', title: 'IMY-anmälan', sub: 'Vi hjälper vid vägran' },
              { icon: '🔒', title: 'Säker betalning', sub: 'Krypterat via Stripe' },
              { icon: '🇸🇪', title: 'Svenskt bolag', sub: 'Registrerat i Sverige' },
            ].map((t) => (
              <div
                key={t.title}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
              >
                <span className="text-3xl">{t.icon}</span>
                <div className="text-white/80 text-sm font-medium">{t.title}</div>
                <div className="text-white/35 text-xs text-center">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="priser" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32">
        <div className="text-center mb-16">
          <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
            Priser
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Enkla <span className="italic gradient-text">priser</span>
          </h2>
          <p className="text-white/45 text-lg">
            Ingen bindningstid. Avsluta när du vill. Scanning alltid gratis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.popular
                  ? 'border-violet-500/50 bg-violet-500/[0.04] glow-violet scale-[1.02]'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/30">
                    ✨ Populärast
                  </span>
                </div>
              )}

              <div className="mb-7">
                <h3 className="font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-5xl text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm">kr/mån</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/register?plan=${plan.tier}`}
                className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40'
                    : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/[0.04]'
                }`}
              >
                Välj {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10">
          Alla priser inkl. moms · Betalning via Stripe · Avsluta när som helst · Gratis scanning
          utan kreditkort
        </p>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-14">
          <p className="text-violet-400/70 text-xs uppercase tracking-widest font-semibold mb-4">
            Frågor & svar
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Vanliga <span className="italic gradient-text">frågor</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pb-32">
        <div className="relative rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 to-transparent pointer-events-none rounded-3xl" />
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium px-4 py-2 rounded-full mb-7 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            Dina uppgifter exponeras just nu
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 relative z-10">
            Ta tillbaka din{' '}
            <span className="italic gradient-text">integritet</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
            Börja med en gratis scanning — se exakt var du exponeras. Sedan sköter vi resten
            automatiskt, varje månad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02]"
            >
              🔍 Skanna mig gratis nu →
            </Link>
            <a
              href="#hur-det-fungerar"
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              Hur fungerar det? ↓
            </a>
          </div>
          <p className="text-white/20 text-xs mt-7 relative z-10">
            Inget kreditkort för scanning · 99 kr/mån för aktivt skydd · Avsluta när som helst
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
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
