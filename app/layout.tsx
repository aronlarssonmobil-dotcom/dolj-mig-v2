import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  title: {
    default: 'Dölj Mig — Ta bort personuppgifter från internet automatiskt',
    template: '%s | Dölj Mig',
  },
  description:
    'Ta bort personuppgifter från internet automatiskt. Vi hittar dig på ratsit, mrkoll, hitta.se och 4 andra svenska sajter och skickar GDPR-krav om borttagning — på autopilot.',
  keywords: [
    'ta bort personuppgifter från internet',
    'dölj mig från ratsit',
    'ta bort uppgifter från mrkoll',
    'GDPR borttagning personuppgifter',
    'skydda personuppgifter online',
    'ta bort adress från internet',
    'integritetsskydd',
    'GDPR',
    'ratsit ta bort',
    'mrkoll ta bort',
    'dolj mig',
    'skydda din adress',
    'ta bort sig från hitta.se',
    'ta bort personuppgifter eniro',
  ],
  authors: [{ name: 'Dölj Mig', url: 'https://dolj-mig.se' }],
  creator: 'Dölj Mig',
  publisher: 'Dölj Mig AB',
  metadataBase: new URL('https://dolj-mig.se'),
  alternates: {
    canonical: 'https://dolj-mig.se',
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://dolj-mig.se',
    title: 'Dölj Mig — Ta bort personuppgifter från internet',
    description:
      'Automatisk borttagning av personuppgifter från ratsit, mrkoll, hitta.se och fler. GDPR-skydd på autopilot.',
    siteName: 'Dölj Mig',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dölj Mig — Skydda din integritet online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dölj Mig — Ta bort personuppgifter från internet',
    description: 'Automatisk GDPR-skydd mot ratsit, mrkoll, hitta.se och fler.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dölj Mig',
  url: 'https://dolj-mig.se',
  logo: 'https://dolj-mig.se/logo.png',
  description:
    'Dölj Mig hjälper dig ta bort personuppgifter från internet — ratsit, mrkoll, hitta.se och fler svenska sajter. GDPR-baserat integritetsskydd på autopilot.',
  email: 'hej@dolj-mig.se',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SE',
  },
  sameAs: [],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dölj Mig',
  url: 'https://dolj-mig.se',
  description:
    'Ta bort personuppgifter från internet. Automatisk GDPR-borttagning från ratsit, mrkoll och fler svenska sajter.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dolj-mig.se/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hur lång tid tar det att ta bort mina personuppgifter från internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vi skickar GDPR-kravet direkt. Sajterna är lagligt skyldiga att svara inom 30 dagar. De flesta tar bort uppgifterna inom 1–2 veckor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hur tar jag bort mig från ratsit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dölj Mig skickar automatiskt ett GDPR-krav till ratsit.se med stöd i Artikel 17 GDPR. Ratsit är skyldiga att radera dina uppgifter inom 30 dagar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan jag ta bort uppgifter från mrkoll?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, Dölj Mig skickar borttagningskrav till mrkoll.se och alla andra svenska sajter som publicerar dina personuppgifter.',
      },
    },
    {
      '@type': 'Question',
      name: 'Är det lagligt att begära borttagning av personuppgifter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolut. GDPR Artikel 17 ger dig rätten att bli raderad. Sajternas publicering av dina uppgifter saknar i de flesta fall rättslig grund.',
      },
    },
    {
      '@type': 'Question',
      name: 'Vad händer om en sajt vägrar ta bort mina uppgifter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Om en sajt avvisar begäran utan giltig anledning hjälper vi dig att anmäla till Integritetsskyddsmyndigheten (IMY), som kan döma ut böter.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan jag avsluta mitt abonnemang när som helst?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Inga bindningstider. Du kan avsluta i inställningarna när du vill. Skyddet gäller till periodens slut.',
      },
    },
  ],
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Dölj Mig',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  url: 'https://dolj-mig.se',
  description:
    'Automatisk borttagning av personuppgifter från ratsit, mrkoll, hitta.se och fler svenska sajter via GDPR-krav.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Grundskydd',
      price: '99',
      priceCurrency: 'SEK',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99',
        priceCurrency: 'SEK',
        unitText: 'MONTH',
      },
    },
    {
      '@type': 'Offer',
      name: 'Fullständigt Skydd',
      price: '149',
      priceCurrency: 'SEK',
    },
    {
      '@type': 'Offer',
      name: 'Familjeskydd',
      price: '249',
      priceCurrency: 'SEK',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#080808] text-white`}>
        {children}
      </body>
    </html>
  )
}
