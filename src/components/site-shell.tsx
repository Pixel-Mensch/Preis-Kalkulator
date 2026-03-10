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
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(248,244,236,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white">
              {companyInitials || "KR"}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                Unverbindliche Kostenschaetzung
              </p>
              <p className="text-sm font-semibold text-slate-950">{companyName}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${contactPhone}`}
              className="hidden rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white sm:inline-flex"
            >
              {contactPhone}
            </a>
            <Link
              href="/rechner"
              className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              Anfrage starten
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
              Digitale Ersteinschaetzung fuer Entruempelungen, Haushaltsaufloesungen
              und Raeumungen.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Einsatzgebiet</p>
            <p className="mt-2 leading-6">{serviceAreaNote}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Kontakt</p>
            <p className="mt-2 leading-6">{contactPhone}</p>
            <p>{contactEmail}</p>
            {supportHours ? <p>{supportHours}</p> : null}
          </div>
          <div>
            <p className="font-semibold text-slate-950">Standort</p>
            <p className="mt-2 leading-6">{city}</p>
            {website ? (
              <a href={website} className="font-medium text-[var(--accent-deep)]" target="_blank" rel="noreferrer">
                Website oeffnen
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
