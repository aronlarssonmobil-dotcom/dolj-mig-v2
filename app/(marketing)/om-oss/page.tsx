import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Om oss',
  description:
    'Lär dig om Dölj Mig — tjänsten som automatiskt tar bort personuppgifter från internet via GDPR-krav. Vi skyddar din integritet på autopilot.',
  alternates: {
    canonical: 'https://dolj-mig.se/om-oss',
  },
}

export default function OmOssPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[15%] w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-5xl mx-auto border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            D
          </div>
          <span className="font-semibold text-white">Dölj Mig</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Tillbaka
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
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
          🇸🇪 Byggt i Sverige för svenska förhållanden
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
          Vi tror att din adress
          <br />
          <span className="italic text-violet-400">är din information</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          Dölj Mig grundades av personer som tröttnade på att personuppgifter sprids på svenska
          sajter utan samtycke. Vi byggde en tjänst som automatiskt tar hand om det — åt dig.
        </p>
      </section>

      {/* Problem section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Problemet vi löser</h2>
            <div className="space-y-4 text-white/50 text-sm leading-relaxed">
              <p>
                Idag är det möjligt för vem som helst att söka upp ditt namn på sajter som
                <strong className="text-white/80"> Ratsit.se, MrKoll.se, Hitta.se och Eniro</strong>{' '}
                och se din exakta adress, telefonnummer och ibland till och med inkomstuppgifter.
              </p>
              <p>
                Det är ett allvarligt integritetsproblem. Stalkers, ex-partners, grannar och
                telefonförsäljare kan enkelt hitta var du bor — utan din vetskap eller tillåtelse.
              </p>
              <p>
                GDPR ger dig rätten att kräva borttagning. Men att göra det manuellt på sju olika
                sajter, sedan bevaka att de inte läggs upp igen, tar tid och kräver kunskap om
                juridiska formuleringar.
              </p>
              <p>
                <strong className="text-white/80">Det är precis det vi gör åt dig.</strong> Automatiskt,
                juridiskt korrekt och med löpande bevakning.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { site: 'Ratsit.se', data: 'Namn, adress, inkomst, ålder', icon: '📋' },
              { site: 'MrKoll.se', data: 'Personnummer, bolagsinfo, familj', icon: '🔎' },
              { site: 'Hitta.se', data: 'Adress, telefon, karta', icon: '📍' },
              { site: 'Eniro.se', data: 'Kontaktuppgifter, historik', icon: '🏢' },
              { site: 'Merinfo.se', data: 'Personnummer, ekonomi', icon: '📊' },
              { site: 'Birthday.se', data: 'Namn, födelsedag, bostadsort', icon: '🎂' },
              { site: 'Upplysning.se', data: 'Ekonomi, betalningsanmärkningar', icon: '💡' },
            ].map((s) => (
              <div
                key={s.site}
                className="flex items-center gap-3 bg-red-500/[0.03] border border-red-500/10 rounded-xl p-3.5"
              >
                <span className="text-base">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium">{s.site}</p>
                  <p className="text-white/30 text-xs">{s.data}</p>
                </div>
                <span className="text-red-400/60 text-xs">Visar dig</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works deep dive */}
      <section className="relative z-10 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">
          <h2 className="text-2xl font-semibold text-white mb-12 text-center">
            Hur vi tar bort dina personuppgifter från internet
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Automatisk scanning',
                desc: 'Vi använder Google Custom Search och direkta sökningar mot varje sajts databas för att hitta profiler som matchar dina uppgifter. Scanning tar ungefär 15 sekunder.',
                icon: '🔍',
              },
              {
                step: '2',
                title: 'GDPR-krav skickas',
                desc: 'För varje träff skickar vi ett juridiskt korrekt borttagningskrav med stöd i GDPR Artikel 17 — "Rätten att bli raderad". Kravet är anpassat per sajt.',
                icon: '📨',
              },
              {
                step: '3',
                title: 'Löpande bevakning',
                desc: 'Varje månad scannar vi igen. Dina uppgifter kan återkomma när sajterna uppdaterar sina databaser. Vi ser till att nya uppgifter tas bort direkt.',
                icon: '🔁',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-20">
        <h2 className="text-2xl font-semibold text-white mb-10 text-center">Våra värderingar</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              icon: '🔐',
              title: 'Integritet är en rättighet',
              desc: 'Alla förtjänar rätten att kontrollera sina egna uppgifter. GDPR ger dig den rätten — vi hjälper dig utnyttja den.',
            },
            {
              icon: '⚡',
              title: 'Automatiserat, inte manuellt',
              desc: 'Vi tror att skyddet ska vara enkelt. Inga formulär att fylla i, inga mejl att skriva. Du registrerar dig och vi sköter resten.',
            },
            {
              icon: '🏛️',
              title: 'Lagligt och transparent',
              desc: 'Alla borttagningskrav skickas med korrekt juridisk grund. Inget hokuspokus — bara GDPR som fungerar.',
            },
            {
              icon: '🌱',
              title: 'Dina data stannar hos oss',
              desc: 'Vi säljer aldrig din information. Dina uppgifter används enbart för att ta bort dem från internet — inget annat.',
            },
          ].map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
            >
              <span className="text-2xl flex-shrink-0">{v.icon}</span>
              <div>
                <h3 className="font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SEO block */}
      <section className="relative z-10 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-20">
          <h2 className="text-2xl font-semibold text-white mb-10 text-center">
            Vanliga frågor om tjänsten
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Kan jag ta bort mig från ratsit med Dölj Mig?',
                a: 'Ja. Ratsit.se är en av de sju svenska sajter vi automatiskt skickar GDPR-krav till. Ratsit är skyldiga att radera dina uppgifter inom 30 dagar.',
              },
              {
                q: 'Hur tar jag bort uppgifter från mrkoll?',
                a: 'Dölj Mig skickar automatiskt ett borttagningskrav till gdpr@mrkoll.se. Du behöver inte göra något själv.',
              },
              {
                q: 'Fungerar GDPR-borttagning för personuppgifter på alla sajter?',
                a: 'Vi täcker de sju vanligaste svenska sajtorna: Ratsit, MrKoll, Merinfo, Hitta.se, Eniro, Birthday.se och Upplysning.se. Fler sajter kan tillkomma.',
              },
              {
                q: 'Hur skyddar ni mina egna personuppgifter?',
                a: 'Vi krypterar all känslig data, lagrar aldrig fullständiga personnummer i klartext och följer GDPR fullt ut. Läs mer i vår integritetspolicy.',
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-white/[0.05] pb-6">
                <h3 className="text-white font-medium mb-2 text-sm">{item.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pb-24">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-indigo-500/4 p-12 text-center overflow-hidden">
          <h2 className="text-3xl font-serif text-white mb-4">
            Redo att skydda din integritet?
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-md mx-auto">
            Starta idag. Ingen bindningstid. Vi sköter allt — du behöver inte förstå juridik.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            Starta skyddet — 99 kr/mån →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <Link href="/integritetspolicy" className="hover:text-white/60 transition-colors">
              Integritetspolicy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Villkor
            </Link>
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
