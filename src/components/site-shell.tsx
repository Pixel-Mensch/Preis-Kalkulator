import Link from "next/link";
import type { ReactNode } from "react";

type SiteShellProps = {
  companyName: string;
  contactPhone: string;
  serviceAreaNote: string;
  supportHours?: string | null;
  children: ReactNode;
};

export function SiteShell({
  companyName,
  contactPhone,
  serviceAreaNote,
  supportHours,
  children,
}: SiteShellProps) {
  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(248,244,236,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white">
              EK
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                Kostenschaetzung
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
              Rechner starten
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-[var(--foreground-soft)] sm:grid-cols-3 sm:px-8">
          <div>
            <p className="font-semibold text-slate-950">{companyName}</p>
            <p className="mt-2 leading-6">
              Unverbindliche Ersteinschaetzung fuer Entruempelungen und
              Haushaltsaufloesungen.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Einsatzgebiet</p>
            <p className="mt-2 leading-6">{serviceAreaNote}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">Kontakt</p>
            <p className="mt-2 leading-6">{contactPhone}</p>
            {supportHours ? <p>{supportHours}</p> : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
