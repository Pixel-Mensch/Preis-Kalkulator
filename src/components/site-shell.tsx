import Link from "next/link";
import type { ReactNode } from "react";

type SiteShellProps = {
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  website?: string | null;
  city: string;
  serviceAreaNote: string;
  supportHours?: string | null;
  children: ReactNode;
};

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SiteShell({
  companyName,
  contactPhone,
  contactEmail,
  website,
  city,
  serviceAreaNote,
  supportHours,
  children,
}: SiteShellProps) {
  const companyInitials = getCompanyInitials(companyName);

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(248,244,236,0.92)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-[0_2px_10px_rgba(199,100,45,0.35)] transition group-hover:shadow-[0_4px_16px_rgba(199,100,45,0.45)] group-hover:scale-105">
              {companyInitials || "KR"}
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                Unverbindliche Kostenschätzung
              </p>
              <p className="text-sm font-semibold text-slate-950">{companyName}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${contactPhone}`}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white sm:inline-flex"
            >
              <svg className="h-3.5 w-3.5 text-[var(--accent-deep)]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 11V14H13A10 10 0 012 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {contactPhone}
            </a>
            <Link
              href="/rechner"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(199,100,45,0.3)] transition hover:bg-[var(--accent-deep)] hover:shadow-[0_4px_14px_rgba(199,100,45,0.4)]"
            >
              Anfrage starten
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-[var(--foreground-soft)] sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
          <div>
            <p className="font-semibold text-slate-950">{companyName}</p>
            <p className="mt-2 leading-6">
              Digitale Ersteinschätzung für Entrümpelungen,
              Haushaltsauflösungen und Räumungen.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Einsatzgebiet</p>
            <p className="mt-2 leading-6">{serviceAreaNote}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Kontakt</p>
            <a
              href={`tel:${contactPhone}`}
              className="mt-2 flex items-center gap-1.5 leading-6 transition hover:text-[var(--accent-deep)]"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 11V14H13A10 10 0 012 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {contactPhone}
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-1.5 transition hover:text-[var(--accent-deep)]"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12v9H2zM2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {contactEmail}
            </a>
            {supportHours ? <p className="mt-1">{supportHours}</p> : null}
          </div>
          <div>
            <p className="font-semibold text-slate-950">Standort</p>
            <p className="mt-2 leading-6">{city}</p>
            {website ? (
              <a
                href={website}
                className="inline-flex items-center gap-1 font-medium text-[var(--accent-deep)] transition hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Website öffnen
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 10L10 2M5 2h5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
        <div className="border-t border-[var(--line)] px-5 py-4 text-center text-xs text-[var(--foreground-soft)] sm:px-8">
          &copy; {new Date().getFullYear()} {companyName} &mdash; Alle Preisangaben unverbindlich
        </div>
      </footer>
    </div>
  );
}
