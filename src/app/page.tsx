import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { getCompanySettings } from "@/lib/company";

export default async function HomePage() {
  const companySettings = await getCompanySettings();

  return (
    <SiteShell
      companyName={companySettings.companyName}
      contactPhone={companySettings.contactPhone}
      serviceAreaNote={companySettings.serviceAreaNote}
      supportHours={companySettings.supportHours}
    >
      <main>
        <section className="section-anchor">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
            <div className="self-center">
              <p className="eyebrow text-[var(--accent-deep)]">Entruempler Angebotsrechner V1</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Schnell zur ersten Preisspanne fuer Entruempelung und Haushaltsaufloesung
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
                Kunden erhalten in wenigen Minuten eine unverbindliche Einschaetzung. Dein
                Team bekommt strukturierte Anfragen statt unvollstaendiger Nachrichten.
              </p>
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
                  Rueckruf anfragen
                </a>
              </div>
            </div>
            <div className="panel rounded-[2.2rem] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                So funktioniert es
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  "Objekt, Flaeche und Zugang erfassen",
                  "Extras und Sonderfaelle angeben",
                  "Preisspanne sofort sehen",
                  "Anfrage mit wenigen Kontaktdaten absenden",
                ].map((item, index) => (
                  <li
                    key={item}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-5 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                      Schritt {index + 1}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.7)]">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-3">
            {[
              {
                title: "Vertrauenswuerdige Sprache",
                text: "Keine ueberzogenen Versprechen. Kunden sehen klar, dass es sich um eine unverbindliche Einschaetzung handelt.",
              },
              {
                title: "Strukturierte Leads",
                text: "Alle relevanten Angaben liegen bereits im Datensatz vor: Objekt, Zugang, Extras, Risiken und Kontaktdaten.",
              },
              {
                title: "Fuer mobile Nutzung gebaut",
                text: "Der komplette Rechner ist fuer Smartphones optimiert und laesst sich unterwegs sauber bedienen.",
              },
            ].map((item) => (
              <article key={item.title} className="panel rounded-[2rem] p-6">
                <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-anchor">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
            <div className="panel rounded-[2.3rem] px-6 py-8 sm:px-10 sm:py-10">
              <p className="eyebrow text-[var(--accent-deep)]">Einsatzgebiet</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                {companySettings.serviceAreaNote}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--foreground-soft)]">
                Die Zonenlogik ist bereits hinterlegt und laesst sich im Adminbereich fuer
                dein konkretes Einsatzgebiet anpassen.
              </p>
              <div className="mt-8">
                <Link
                  href="/rechner"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  Rechner oeffnen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
