import Link from "next/link";

import { ConfigurationState } from "@/components/configuration-state";
import { SiteShell } from "@/components/site-shell";
import { getCompanySettingsState } from "@/lib/company";

const processSteps = [
  {
    title: "Angaben in wenigen Minuten",
    text: "Objektart, Größe, Zugang und Besonderheiten direkt im Rechner eingeben.",
  },
  {
    title: "Preisrahmen sofort sehen",
    text: "Sie erhalten eine unverbindliche Kostenschätzung als klare Preisspanne.",
  },
  {
    title: "Rückmeldung ohne langes Nachfragen",
    text: "Ihre Anfrage landet strukturiert bei uns und kann schneller eingeordnet werden.",
  },
] as const;

const useCases = [
  "Wohnung oder Haus nach Auszug",
  "Keller, Dachboden oder Garage",
  "Nachlass, Wohnungsaufgabe oder Vermietung",
  "Büroräumung mit Zusatzaufwand",
] as const;

const customerBenefits = [
  {
    iconPath: "M10 2L3 11h7l-1 7 8-10h-7l1-6z",
    title: "Schneller Preisrahmen",
    text: "Schon vor dem ersten Rückruf sehen Sie eine realistische Orientierung für den Aufwand.",
  },
  {
    iconPath: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    title: "Weniger Rückfragen",
    text: "Wir erhalten die wichtigsten Angaben direkt strukturiert und können Ihre Anfrage gezielter bearbeiten.",
  },
  {
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Sorgfältige Einordnung",
    text: "Besondere Fälle wie Schimmel, Messi-Haushalt oder Sondermüll werden klar gekennzeichnet und persönlich geprüft.",
  },
] as const;

const heroBullets = [
  "Geeignet für Wohnungen, Häuser, Keller, Dachböden, Garagen und Büros",
  "Besondere Fälle werden vorsichtig eingeordnet und manuell geprüft",
  "Die Einschätzung ist unverbindlich und dient der ersten Orientierung",
] as const;

const trustItems = [
  "Kostenlos & unverbindlich",
  "Keine Anmeldung nötig",
  "Preisrahmen in 5 Minuten",
] as const;

const heroStats = [
  {
    value: "ca. 5 Minuten",
    label: "bis zur ersten Orientierung",
  },
  {
    value: "1 strukturierte Anfrage",
    label: "statt mehrerer unklarer Nachrichten",
  },
  {
    value: "Sonderfälle sichtbar",
    label: "für persönliche Prüfung markiert",
  },
] as const;

const rightPanelItems = [
  "Objektart, Fläche und Füllgrad",
  "Etage, Aufzug und Laufweg",
  "Extras wie Küche abbauen oder besenrein",
  "PLZ, Wunschdatum und Kontaktdaten",
] as const;

const reassuranceItems = [
  "Preisrahmen statt starrem Festpreis",
  "Persönliche Prüfung bei Sonderfällen",
  "Direkter Kontakt ohne Registrierung",
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.5L6.5 12L13 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HomePage() {
  const { companySettings, isConfigured } = await getCompanySettingsState();

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
        {!isConfigured ? (
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
            <ConfigurationState
              title="Die öffentliche Demo wird gerade eingerichtet"
              description="Die Landingpage ist erreichbar, aber Firmendaten oder Preisprofil sind noch nicht vollständig hinterlegt. Sobald die Grundkonfiguration steht, kann der Rechner wieder belastbar genutzt werden."
              actionHint="Für lokale Demos `npm run db:seed` oder `npm run db:reset-demo` ausführen. Für Pilotkunden bitte zuerst Firmen- und Preisdaten vervollständigen."
            />
          </div>
        ) : null}
        {isConfigured ? (
          <>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="section-anchor">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-18">
            <div className="self-center">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                  Digitale Kostenschätzung
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                  Unverbindliche Anfrage
                </span>
              </div>
              <p className="eyebrow mt-4 text-[var(--accent-deep)]">
                {companySettings.companyName}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.7rem] lg:leading-[1.04]">
                Entrümpelung anfragen und sofort einen unverbindlichen
                Preisrahmen erhalten
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
                Mit wenigen Angaben erhalten Sie eine transparente
                Ersteinschätzung. Gleichzeitig entsteht eine strukturierte
                Anfrage, damit wir schneller, klarer und ohne unnötige
                Rückfragen reagieren können.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-[var(--foreground-soft)]">
                {heroBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rechner"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(199,100,45,0.34)] transition hover:bg-[var(--accent-deep)] hover:shadow-[0_12px_28px_rgba(199,100,45,0.4)]"
                >
                  Jetzt Kostenschätzung starten
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={`tel:${companySettings.contactPhone}`}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                >
                  Telefonisch anfragen
                </a>
              </div>
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                Ohne Registrierung. Die Einschätzung bleibt unverbindlich und dient der
                ersten Orientierung.
              </p>

              {/* Trust strip */}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {trustItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-xs text-[var(--foreground-soft)]"
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-[1.6rem] border border-[var(--line)] bg-white/72 px-4 py-4 shadow-[0_14px_30px_rgba(37,45,57,0.05)]"
                  >
                    <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--foreground-soft)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rechte Spalte */}
            <div className="space-y-4">
              <div className="panel grid-glow overflow-hidden rounded-[2.2rem] p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  So hilft die Anfrage
                </p>
                <ul className="mt-6 space-y-3">
                  {rightPanelItems.map((item, index) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3.5 text-sm font-medium text-slate-950"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel rounded-[2rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  Verlässliche Einordnung
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
                  {reassuranceItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
                  <p className="font-semibold text-slate-950">{companySettings.contactPhone}</p>
                  <p>{companySettings.contactEmail}</p>
                  <p className="mt-2">{companySettings.serviceAreaNote}</p>
                </div>
              </div>
              <div className="panel rounded-[2rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  Geeignet für
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

        {/* ── Vorteile ──────────────────────────────────────────── */}
        <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow text-[var(--accent-deep)]">Vorteile</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                Praktisch für Kunden, hilfreich für die schnelle Bearbeitung
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                Die Anfrage sammelt genau die Angaben, die für eine erste Einschätzung und
                eine sinnvolle Rückmeldung wirklich gebraucht werden.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {customerBenefits.map((item) => (
                <article
                  key={item.title}
                  className="panel lift rounded-[2rem] p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                    <svg
                      className="h-5 w-5 text-[var(--accent)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={item.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── So funktioniert es ────────────────────────────────── */}
        <section className="section-anchor">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-[var(--accent-deep)]">
                  So funktioniert es
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                  Von der ersten Angabe bis zur strukturierten Anfrage
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)]">
                Die Eingaben dienen nicht nur der Preisspanne. Sie helfen uns
                auch, den Aufwand realistisch einzuschätzen und die Anfrage
                schneller zu bearbeiten.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="panel lift relative overflow-hidden rounded-[2rem] p-6"
                >
                  <div
                    className="pointer-events-none absolute -right-1 -top-5 select-none text-9xl font-black leading-none text-[var(--accent)] opacity-[0.055]"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>
                  <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                    Schritt {index + 1}
                  </p>
                  <h3 className="relative mt-3 text-xl font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Unterer CTA ───────────────────────────────────────── */}
        <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="panel rounded-[2rem] p-6 sm:p-8">
              <p className="eyebrow text-[var(--accent-deep)]">
                Wichtiger Hinweis
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                Eine Kostenschätzung ersetzt keine Besichtigung bei
                Sonderfällen
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                Bei starkem Füllgrad, problematischen Stoffen oder schwierigen
                Zugangssituationen zeigen wir weiterhin einen Preisrahmen,
                kennzeichnen die Anfrage aber klar für die persönliche Prüfung.
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
                Wenn Sie im Einsatzgebiet liegen, können Sie die Anfrage direkt
                online vorbereiten. Für besondere Situationen melden wir uns
                persönlich.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rechner"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(199,100,45,0.3)] transition hover:bg-[var(--accent-deep)]"
                >
                  Rechner öffnen
                  <ArrowRightIcon className="h-4 w-4" />
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
          </>
        ) : null}
      </main>
    </SiteShell>
  );
}
