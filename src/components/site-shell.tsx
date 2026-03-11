import Link from "next/link";
import type { ReactNode } from "react";

type SiteShellProps = {
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  website?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city: string;
  serviceAreaNote: string;
  supportHours?: string | null;
  isConfigured?: boolean;
  children: ReactNode;
};

const navigationItems = [
  {
    href: "/#vorteile",
    label: "Vorteile",
  },
  {
    href: "/#ablauf",
    label: "Ablauf",
  },
  {
    href: "/#kontakt",
    label: "Kontakt",
  },
] as const;

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAddressLine(
  street: string | null | undefined,
  postalCode: string | null | undefined,
  city: string,
) {
  if (street && postalCode) {
    return `${street}, ${postalCode} ${city}`;
  }

  return city;
}

function getWebsiteHref(website: string | null | undefined) {
  if (!website) {
    return null;
  }

  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 11V14H13A10 10 0 012 3z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4h12v9H2zM2 4l6 5 6-5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14s4-3.2 4-7A4 4 0 104 7c0 3.8 4 7 4 7z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="7" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 5v3.2l2.2 1.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteShell({
  companyName,
  contactPhone,
  contactEmail,
  website,
  street,
  postalCode,
  city,
  serviceAreaNote,
  supportHours,
  isConfigured = true,
  children,
}: SiteShellProps) {
  const displayName = isConfigured ? companyName : "Öffentliche Anfrage";
  const companyInitials = getCompanyInitials(displayName);
  const addressLine = getAddressLine(street, postalCode, city);
  const websiteHref = getWebsiteHref(website);
  const showPhone = isConfigured && Boolean(contactPhone);
  const showEmail = isConfigured && Boolean(contactEmail);

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(247,242,234,0.94)] shadow-[0_10px_30px_rgba(29,36,48,0.06)] backdrop-blur-md">
        <div className="border-b border-[var(--line)]/80 bg-[rgba(255,255,255,0.48)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-2 text-xs text-[var(--foreground-soft)] sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            {isConfigured ? (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <PinIcon className="h-3.5 w-3.5 text-[var(--accent-deep)]" />
                    Regional in {city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <PhoneIcon className="h-3.5 w-3.5 text-[var(--accent-deep)]" />
                    Direkter Kontakt mit dem Betrieb
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {supportHours ? (
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon className="h-3.5 w-3.5 text-[var(--accent-deep)]" />
                      {supportHours}
                    </span>
                  ) : null}
                  <span>{serviceAreaNote}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 text-[var(--accent-deep)]" />
                  Öffentliche Anfrage wird vorbereitet
                </span>
                <span>Kontakt, Einsatzgebiet und Rechtliches erscheinen nach Freigabe.</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-[0_4px_16px_rgba(199,100,45,0.34)] transition group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(199,100,45,0.38)]">
              {companyInitials || "ÖA"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                {isConfigured ? "Entrümpelung anfragen" : "Öffentliche Anfrage"}
              </p>
              <p className="truncate text-sm font-semibold text-slate-950">
                {isConfigured ? companyName : "Bereich wird eingerichtet"}
              </p>
            </div>
          </Link>

          {isConfigured ? (
            <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--foreground-soft)] lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {showPhone ? (
              <>
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-slate-950 transition hover:bg-[var(--surface-muted)] sm:hidden"
                  aria-label={`Jetzt anrufen: ${contactPhone}`}
                >
                  <PhoneIcon className="h-4 w-4 text-[var(--accent-deep)]" />
                </a>
                <a
                  href={`tel:${contactPhone}`}
                  className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-[var(--surface-muted)] lg:inline-flex"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-[var(--accent-deep)]" />
                  {contactPhone}
                </a>
              </>
            ) : null}
            {isConfigured ? (
              <Link
                href="/rechner"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(199,100,45,0.3)] transition hover:bg-[var(--accent-deep)] hover:shadow-[0_8px_20px_rgba(199,100,45,0.38)]"
              >
                Preisrahmen anfragen
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
                Noch nicht freigegeben
              </span>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,254,251,0.94),rgba(245,239,230,0.92))]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="surface-card rounded-[2rem] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  {isConfigured ? "Noch Fragen zur Anfrage?" : "Öffentliche Anfrage in Vorbereitung"}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {isConfigured
                    ? "Direkter Kontakt statt unklarer Weiterleitung"
                    : "Kontakt, Vertrauen und Rechtliches werden hier sauber gebündelt"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                  {isConfigured
                    ? "Wenn Sie lieber direkt sprechen möchten, erreichen Sie den Betrieb telefonisch oder per E-Mail. Die Kostenschätzung bleibt unverbindlich."
                    : "Sobald Firmendaten, Einsatzgebiet und Preise vollständig hinterlegt sind, erscheint hier der direkte Kontakt zum Betrieb samt rechtlicher Einbindung."}
                </p>
              </div>
              {isConfigured ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {showPhone ? (
                    <a
                      href={`tel:${contactPhone}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
                    >
                      Anrufen
                    </a>
                  ) : null}
                  {showEmail ? (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
                    >
                      E-Mail schreiben
                    </a>
                  ) : null}
                  <Link
                    href="/rechner"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                  >
                    Preisrahmen starten
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-8 text-sm text-[var(--foreground-soft)] sm:grid-cols-2 xl:grid-cols-[1.05fr_0.9fr_0.9fr_1fr]">
            <div>
              <p className="font-semibold text-slate-950">{displayName}</p>
              <p className="mt-2 leading-6">
                {isConfigured
                  ? "Unverbindliche Ersteinschätzung für Entrümpelungen, Haushaltsauflösungen und Räumungen mit direkter Rückmeldung durch den Betrieb."
                  : "Dieser Bereich wird für eine saubere öffentliche Anfrage vorbereitet. Nach Freigabe erscheinen hier Betrieb, Nutzen und Kontakt klar gebündelt."}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-950">
                {isConfigured ? "Einsatzgebiet" : "Freigabe"}
              </p>
              <p className="mt-2 leading-6">
                {isConfigured
                  ? serviceAreaNote
                  : "Einsatzgebiet, Preislogik und Kundenhinweise werden aktuell abgestimmt."}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-950">Kontakt</p>
              {isConfigured ? (
                <>
                  {showPhone ? (
                    <a
                      href={`tel:${contactPhone}`}
                      className="mt-2 flex items-center gap-1.5 leading-6 transition hover:text-[var(--accent-deep)]"
                    >
                      <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                      {contactPhone}
                    </a>
                  ) : null}
                  {showEmail ? (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-1.5 leading-6 transition hover:text-[var(--accent-deep)]"
                    >
                      <MailIcon className="h-3.5 w-3.5 shrink-0" />
                      {contactEmail}
                    </a>
                  ) : null}
                  {supportHours ? <p className="mt-1 leading-6">{supportHours}</p> : null}
                </>
              ) : (
                <p className="mt-2 leading-6">
                  Kontaktdaten werden erst nach Freigabe der öffentlichen Anfrage eingeblendet.
                </p>
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-950">
                {isConfigured ? "Standort und Rechtliches" : "Rechtliches"}
              </p>
              <p className="mt-2 leading-6">
                {isConfigured
                  ? addressLine
                  : "Impressum und Datenschutz werden zusammen mit den Firmendaten an dieser Stelle eingebunden."}
              </p>
              {websiteHref ? (
                <a
                  href={websiteHref}
                  className="mt-2 inline-flex items-center gap-1 font-medium text-[var(--accent-deep)] transition hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Firmenwebsite öffnen
                  <ArrowRightIcon className="h-3 w-3" />
                </a>
              ) : null}
              {isConfigured ? (
                <p className="mt-3 text-xs leading-5">
                  Impressum und Datenschutz liegen auf der Firmenwebsite oder werden mit ihr
                  gemeinsam eingebunden.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-5 py-4 text-center text-xs text-[var(--foreground-soft)] sm:px-8">
          &copy; {new Date().getFullYear()} {displayName} · Alle Preisangaben unverbindlich
        </div>
      </footer>
    </div>
  );
}
