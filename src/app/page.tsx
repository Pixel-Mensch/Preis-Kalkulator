import Link from "next/link";

import { ConfigurationState } from "@/components/configuration-state";
import { SiteShell } from "@/components/site-shell";
import { getCompanySettingsState } from "@/lib/company";

const customerBenefits = [
  {
    iconPath: "M4 12l4-4 3 3 7-7",
    title: "Preisrahmen statt Bauchgefühl",
    text: "Sie sehen früh, in welchem Kostenbereich sich die Entrümpelung voraussichtlich bewegt.",
  },
  {
    iconPath: "M4 5h16M4 10h16M4 15h10",
    title: "Anfrage ohne Hin und Her",
    text: "Fläche, Zugang, Extras und Hinweise landen direkt vollständig beim Betrieb.",
  },
  {
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Sonderfälle bleiben sichtbar",
    text: "Hoher Aufwand oder besondere Situationen werden nicht versteckt, sondern persönlich geprüft.",
  },
] as const;

const requestOutcomes = [
  {
    title: "Unverbindliche Kostenspanne",
    text: "Auf Basis Ihrer Angaben sehen Sie direkt einen realistischen ersten Preisrahmen.",
  },
  {
    title: "Direkter Kontakt mit dem Betrieb",
    text: "Ihre Anfrage wird strukturiert vorbereitet und kann gezielter beantwortet werden.",
  },
  {
    title: "Saubere Einordnung besonderer Fälle",
    text: "Schwierige Zugänge, hoher Füllgrad oder Problemstoffe werden klar markiert.",
  },
] as const;

const processSteps = [
  {
    title: "Eckdaten eingeben",
    text: "Objekt, Fläche, Zugang und Besonderheiten in wenigen Minuten erfassen.",
  },
  {
    title: "Preisrahmen sofort sehen",
    text: "Sie erhalten eine unverbindliche erste Kostenspanne als direkte Orientierung.",
  },
  {
    title: "Strukturierte Anfrage absenden",
    text: "Alle wichtigen Angaben liegen dem Betrieb direkt vollständig für die Rückmeldung vor.",
  },
] as const;

const useCases = [
  "Wohnung oder Haus nach Auszug",
  "Keller, Dachboden oder Garage",
  "Haushaltsauflösung oder Nachlass",
  "Räumung vor Verkauf oder Vermietung",
  "Büro oder kleinere Gewerbefläche",
  "Fälle mit Zusatzaufwand oder Sondermüll-Hinweis",
] as const;

const faqItems = [
  {
    question: "Ist die Schätzung verbindlich?",
    answer:
      "Nein. Die Kostenspanne dient der ersten Orientierung. Der endgültige Preis hängt vom tatsächlichen Zustand, Zugang und möglichen Sonderfällen ab.",
  },
  {
    question: "Warum ist die Anfrage sinnvoller als nur eine kurze Nachricht?",
    answer:
      "Weil Fläche, Zugang, Extras und besondere Hinweise direkt vollständig vorliegen. Das spart Rückfragen und macht die Antwort deutlich konkreter.",
  },
  {
    question: "Was passiert nach dem Absenden?",
    answer:
      "Die Anfrage wird geprüft und je nach Aufwand telefonisch oder per E-Mail beantwortet. Bei unklaren oder besonderen Fällen erfolgt eine persönliche Rückmeldung.",
  },
  {
    question: "Kann ich auch bei schwierigen Fällen anfragen?",
    answer:
      "Ja. Gerade dafür ist die strukturierte Anfrage hilfreich. Solche Fälle werden transparent markiert und nicht stillschweigend übergangen.",
  },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
  const trustItems = [
    "Kostenlos und unverbindlich",
    "Keine Registrierung erforderlich",
    `Regional in ${companySettings.city}`,
  ] as const;
  const heroBullets = [
    "Geeignet für Entrümpelung, Haushaltsauflösung und Räumung",
    "Die Kostenspanne ist unverbindlich und dient der ersten Orientierung",
    "Besondere Fälle werden klar markiert und persönlich geprüft",
  ] as const;
  const heroStats = [
    {
      value: "ca. 5 Minuten",
      label: "bis zur ersten Kostenspanne",
    },
    {
      value: "1 strukturierte Anfrage",
      label: "statt mehrerer unklarer Nachrichten",
    },
    {
      value: "Direkter Kontakt",
      label: "mit dem Betrieb statt anonymer Weiterleitung",
    },
  ] as const;

  return (
    <SiteShell
      companyName={companySettings.companyName}
      contactPhone={companySettings.contactPhone}
      contactEmail={companySettings.contactEmail}
      website={companySettings.website}
      street={companySettings.street}
      postalCode={companySettings.postalCode}
      city={companySettings.city}
      serviceAreaNote={companySettings.serviceAreaNote}
      supportHours={companySettings.supportHours}
      isConfigured={isConfigured}
    >
      <main>
        {!isConfigured ? (
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
            <ConfigurationState
              eyebrow="Öffentliche Freigabe ausstehend"
              title="Die öffentliche Anfrage wird gerade vorbereitet"
              description="Firmendaten, Einsatzgebiet und Preislogik werden noch vervollständigt. Sobald alles sauber hinterlegt ist, kann der Rechner wieder regulär genutzt werden."
              actionLabel="Vor Freigabe prüfen"
              actionHint="Im Adminbereich Firmendaten und Preise final hinterlegen und die öffentliche Seite danach einmal komplett durchgehen."
            />
          </div>
        ) : null}
        {isConfigured ? (
          <>
            <section
              id="start"
              className="hero-stage section-anchor border-b border-[var(--line)]"
            >
              <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
                <div className="self-center">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--line)] bg-white/84 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                      Regionale Entrümpelung
                    </span>
                    <span className="rounded-full border border-[var(--line)] bg-white/84 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      Unverbindliche Kostenschätzung
                    </span>
                  </div>

                  <p className="eyebrow mt-5 text-[var(--accent-deep)]">
                    {companySettings.companyName}
                  </p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.8rem] lg:leading-[1.03]">
                    Entrümpelung anfragen und vorab einen realistischen Preisrahmen erhalten
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)] sm:text-lg">
                    Für Wohnung, Haus, Keller, Dachboden oder Haushaltsauflösung. Mit
                    wenigen Angaben erhalten Sie eine unverbindliche erste Kostenspanne und
                    senden Ihre Anfrage direkt strukturiert an den Betrieb.
                  </p>

                  <ul className="mt-7 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
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
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(199,100,45,0.32)] transition hover:bg-[var(--accent-deep)] hover:shadow-[0_14px_30px_rgba(199,100,45,0.4)]"
                    >
                      Preisrahmen kostenlos anfragen
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <a
                      href={`tel:${companySettings.contactPhone}`}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/78 px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                    >
                      Direkt telefonisch anfragen
                    </a>
                  </div>

                  <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                    Ohne Registrierung. Die Anfrage hilft bei einer schnelleren und
                    klareren Rückmeldung.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                    {trustItems.map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-soft)]"
                      >
                        <CheckIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {heroStats.map((item) => (
                      <div
                        key={item.value}
                        className="surface-card rounded-[1.7rem] px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--foreground-soft)]">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="panel overflow-hidden rounded-[2.2rem] p-6 sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                      Was Sie nach der Anfrage konkret haben
                    </p>
                    <div className="mt-6 space-y-3">
                      {requestOutcomes.map((item) => (
                        <article
                          key={item.title}
                          className="rounded-[1.7rem] border border-[var(--line)] bg-[rgba(255,255,255,0.82)] px-4 py-4"
                        >
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                            {item.text}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
                      <p className="font-semibold text-slate-950">Direkter Kontakt zum Betrieb</p>
                      <p className="mt-2">
                        {companySettings.contactPhone}
                        <br />
                        {companySettings.contactEmail}
                      </p>
                      <p className="mt-2">{companySettings.serviceAreaNote}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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

                    <div className="panel rounded-[2rem] p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                        Regional und seriös
                      </p>
                      <p className="mt-4 text-sm leading-6 text-[var(--foreground-soft)]">
                        {companySettings.serviceAreaNote}
                      </p>
                      <p className="mt-4 text-sm font-semibold text-slate-950">
                        {companySettings.city}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                        {companySettings.supportHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="vorteile" className="section-anchor">
              <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
                <div className="max-w-2xl">
                  <p className="eyebrow text-[var(--accent-deep)]">Warum die Anfrage sinnvoll ist</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                    Weniger Rätselraten für Sie, bessere Vorbereitung für den Betrieb
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    Die Anfrage ist bewusst schlank gehalten. Sie liefert genug Information für
                    eine belastbare erste Einordnung, ohne den Prozess unnötig aufzublähen.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                  {customerBenefits.map((item) => (
                    <article key={item.title} className="panel lift rounded-[2rem] p-6">
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
                      <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                        {item.text}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]">
              <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="panel rounded-[2rem] p-6 sm:p-8">
                  <p className="eyebrow text-[var(--accent-deep)]">Vertrauen</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                    Eine transparente Ersteinschätzung ersetzt kein leeres Versprechen
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                    Genau deshalb bleibt die Kostenspanne bewusst unverbindlich. Sie bekommen
                    eine realistische Orientierung, und der Betrieb sieht früh, ob eine kurze
                    Rücksprache oder persönliche Prüfung sinnvoll ist.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">
                        Unverbindlich, aber nicht beliebig
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                        Die Kostenspanne dient der Orientierung und bleibt klar als erste
                        Einschätzung gekennzeichnet.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">
                        Direkter Kontakt statt Blackbox
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                        Ihre Angaben landen mit Telefonnummer, E-Mail und Einsatzgebiet direkt
                        beim Betrieb.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">
                        Besondere Fälle werden offen behandelt
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                        Schwierige Zugänge, hohe Füllgrade oder Problemstoffe werden sichtbar
                        gemacht und nicht stillschweigend schöngerechnet.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-6 sm:p-8">
                  <p className="eyebrow text-[var(--accent-deep)]">Häufige Fragen</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                    Was Endkunden vor der Anfrage meistens wissen möchten
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {faqItems.map((item) => (
                      <article
                        key={item.question}
                        className="rounded-[1.7rem] border border-[var(--line)] bg-white px-5 py-5"
                      >
                        <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                          {item.answer}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="ablauf" className="section-anchor">
              <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="eyebrow text-[var(--accent-deep)]">So läuft es ab</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                      Von der ersten Angabe bis zur strukturierten Anfrage
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)]">
                    Der Ablauf ist bewusst kurz gehalten. Sie sehen schnell eine erste
                    Einordnung, und der Betrieb kann die Anfrage im Anschluss deutlich gezielter
                    bearbeiten.
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

            <section
              id="kontakt"
              className="section-anchor border-y border-[var(--line)] bg-[rgba(255,253,248,0.74)]"
            >
              <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.92fr]">
                <div className="panel rounded-[2rem] p-6 sm:p-8">
                  <p className="eyebrow text-[var(--accent-deep)]">Bereit für die Anfrage?</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                    Jetzt unverbindlich Preisrahmen anfragen
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                    Wenn Sie die wichtigsten Eckdaten angeben, erhalten Sie sofort eine erste
                    Kostenspanne und schicken Ihre Anfrage direkt vollständig an das Team.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      Kostenlos und unverbindlich
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      Sinnvoll für normale Fälle und hilfreich bei Sonderfällen
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      Direkter Kontakt mit dem Betrieb statt unklarer Weiterleitung
                    </li>
                  </ul>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/rechner"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(199,100,45,0.3)] transition hover:bg-[var(--accent-deep)]"
                    >
                      Jetzt Preisrahmen anfragen
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <a
                      href={`tel:${companySettings.contactPhone}`}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                    >
                      Direkt anrufen
                    </a>
                  </div>
                </div>

                <div className="panel rounded-[2rem] p-6 sm:p-8">
                  <p className="eyebrow text-[var(--accent-deep)]">Kontakt und Einsatzgebiet</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
                    {companySettings.serviceAreaNote}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
                    Im Einsatzgebiet kann die Anfrage direkt online vorbereitet werden. Bei
                    besonderen Fällen oder zusätzlichem Abstimmungsbedarf meldet sich der Betrieb
                    persönlich zurück.
                  </p>

                  <div className="mt-6 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
                    <p className="font-semibold text-slate-950">{companySettings.contactPhone}</p>
                    <p>{companySettings.contactEmail}</p>
                    <p className="mt-2">{companySettings.supportHours}</p>
                  </div>

                  <div className="mt-5 rounded-[1.8rem] border border-[var(--line)] bg-white px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
                    <p className="font-semibold text-slate-950">Wichtiger Hinweis</p>
                    <p className="mt-2">{companySettings.estimateFootnote}</p>
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
