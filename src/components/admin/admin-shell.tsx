"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/format";

type AdminShellProps = {
  adminName: string;
  children: ReactNode;
};

const navigationItems = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Tagesüberblick und Prioritäten",
  },
  {
    href: "/admin/anfragen",
    label: "Anfragen",
    description: "Leads sichten, filtern und nachfassen",
  },
  {
    href: "/admin/preise",
    label: "Preise",
    description: "Kalkulation, Zuschläge und Zonen pflegen",
  },
  {
    href: "/admin/firma",
    label: "Firma",
    description: "Kontakt, Einsatzgebiet und Außendarstellung",
  },
] as const;

const dailyWorkflow = [
  "Neue Anfragen zuerst prüfen",
  "Manuelle Prüfungen priorisiert zurückrufen",
  "Nach jedem Kontakt den Status nachziehen",
] as const;

export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="panel rounded-[2rem] p-5 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-3xl border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,234,0.92))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-deep)]">
              Betriebsbereich
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{adminName}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Anfragen sauber nachhalten, Prioritäten erkennen und Preise oder Firmendaten
              ohne Umwege pflegen.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
              >
                Öffentliche Seite
              </Link>
              <Link
                href="/rechner"
                className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
              >
                Rechner öffnen
              </Link>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-slate-950 shadow-[0_12px_30px_rgba(199,100,45,0.12)]"
                      : "border-transparent text-slate-950 hover:border-[var(--line)] hover:bg-[var(--surface-muted)]",
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-soft)]">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
            <p className="font-semibold text-slate-950">Kurz für den Tagesablauf</p>
            <ol className="mt-2 space-y-2">
              {dailyWorkflow.map((item, index) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-5">
              Rückrufe, Besichtigungen und Preisstände sollten direkt im Vorgang nachvollziehbar
              bleiben.
            </p>
          </div>

          <form action="/admin/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              Abmelden
            </button>
          </form>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
