import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { getCompanySettings } from "@/lib/company";

const processSteps = [
  {
    title: "Angaben in wenigen Minuten",
    text: "Objektart, Groesse, Zugang und Besonderheiten direkt im Rechner eingeben.",
  },
  {
    title: "Preisrahmen sofort sehen",
    text: "Sie erhalten eine unverbindliche Kostenschaetzung als klare Preisspanne.",
  },
  {
    title: "Rueckmeldung ohne langes Nachfragen",
    text: "Ihre Anfrage landet strukturiert bei uns und kann schneller eingeordnet werden.",
  },
] as const;

const useCases = [
  "Wohnung oder Haus nach Auszug",
  "Keller, Dachboden oder Garage",
  "Nachlass, Wohnungsaufgabe oder Vermietung",
  "Bueroraeumung mit Zusatzaufwand",
] as const;

const customerBenefits = [
  {
    title: "Schneller Preisrahmen",
    text: "Schon vor dem ersten Rueckruf sehen Sie eine realistische Orientierung fuer den Aufwand.",
  },
  {
    title: "Weniger Rueckfragen",
    text: "Wir erhalten die wichtigsten Angaben direkt strukturiert und koennen Ihre Anfrage gezielter bearbeiten.",
  },
  {
    title: "Sorgfaeltige Einordnung",
    text: "Besondere Faelle wie Schimmel, Messi-Haushalt oder Sondermuell werden klar gekennzeichnet und persoenlich geprueft.",
  },
] as const;

export default async function HomePage() {
  const companySettings = await getCompanySettings();

  return (
    <SiteShell
      companyName={companySettings.companyName}
      contactPhone={companySettings.contactPhone}
      contactEmail={companySettings.contactEmail}
      website={companySettings.website}
      city={companySettings.city}
      serviceAreaNote={companySettings.serviceAreaNote}
      supportHours={companySettings.supportHours}
    >
      <main>
        <section className="section-anchor">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="self-center">
              <p className="eyebrow text-[var(--accent-deep)]">
                {companySettings.companyName}
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Entruempelung anfragen und sofort einen unverbindlichen Preisrahmen erhalten
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
                Mit wenigen Angaben erhalten Sie eine transparente Ersteinschaetzung.
                Gleichzeitig entsteht eine strukturierte Anfrage, damit wir schneller,
                klarer und ohne unnoetige Rueckfragen reagieren koennen.
              </p>
              <div className="mt-6 space-y-3 text-sm text-[var(--foreground-soft)]">
                <p>- Geeignet fuer Wohnungen, Haeuser, Keller, Dachboeden, Garagen und Bueros</p>
                <p>- Besondere Faelle werden vorsichtig eingeordnet und manuell geprueft</p>
                <p>- Die Einschaetzung ist unverbindlich und dient der ersten Orientierung</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rechner"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  Jetzt Kostenschaetzung starten
                </Link>
                <a
                  href={`tel:${companySettings.contactPhone}`}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                >
                  Telefonisch anfragen
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="panel rounded-[2.2rem] p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  So hilft die Anfrage
                </p>
                <ul className="mt-6 space-y-4">
                  {[
                    "Objektart, Flaeche und Fuellgrad",
                    "Etage, Aufzug und Laufweg",
                    "Extras wie Kueche abbauen oder besenrein",
                    "PLZ, Wunschdatum und Kontaktdaten",
                  ].map((item) => (
                    <li
                      key={item}
                      className="rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-5 py-4 text-sm font-medium text-slate-950"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel rounded-[2rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  Geeignet fuer
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {useCases.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-950"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow text-[var(--accent-deep)]">Vorteile</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                Praktisch fuer Kunden, hilfreich fuer die schnelle Bearbeitung
              </h2>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {customerBenefits.map((item) => (
                <article key={item.title} className="panel rounded-[2rem] p-6">
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-anchor">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-[var(--accent-deep)]">So funktioniert es</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                  Von der ersten Angabe bis zur strukturierten Anfrage
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)]">
                Die Eingaben dienen nicht nur der Preisspanne. Sie helfen uns auch, den
                Aufwand realistisch einzuschaetzen und die Anfrage schneller zu bearbeiten.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <article key={step.title} className="panel rounded-[2rem] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                    Schritt {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="panel rounded-[2rem] p-6 sm:p-8">
              <p className="eyebrow text-[var(--accent-deep)]">Wichtiger Hinweis</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                Eine Kostenschaetzung ersetzt keine Besichtigung bei Sonderfaellen
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                Bei starkem Fuellgrad, problematischen Stoffen oder schwierigen
                Zugangssituationen zeigen wir weiterhin einen Preisrahmen, kennzeichnen
                die Anfrage aber klar fuer die persoenliche Pruefung.
              </p>
              <div className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-5 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
                {companySettings.estimateFootnote}
              </div>
            </div>
            <div className="panel rounded-[2rem] p-6 sm:p-8">
              <p className="eyebrow text-[var(--accent-deep)]">Einsatzgebiet</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                {companySettings.serviceAreaNote}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                Wenn Sie im Einsatzgebiet liegen, koennen Sie die Anfrage direkt online
                vorbereiten. Fuer besondere Situationen melden wir uns persoenlich.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rechner"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  Rechner oeffnen
                </Link>
                <a
                  href={`mailto:${companySettings.contactEmail}`}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                >
                  Per E-Mail anfragen
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
