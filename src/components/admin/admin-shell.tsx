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
    description: "Überblick und Prioritäten",
  },
  {
    href: "/admin/anfragen",
    label: "Anfragen",
    description: "Leads prüfen und sortieren",
  },
  {
    href: "/admin/preise",
    label: "Preise",
    description: "Kalkulation für neue Vorgänge",
  },
  {
    href: "/admin/firma",
    label: "Firma",
    description: "Kontakt- und Brandingdaten",
  },
] as const;

export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="panel rounded-[2rem] p-5 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-3xl border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,243,234,0.92))] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-deep)]">
              Verwaltung
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{adminName}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Anfragen strukturiert prüfen, Prioritäten erkennen und Preise für neue
              Vorgänge anpassen.
            </p>
          </div>

          <nav className="mt-5 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "page"
                    : undefined
                }
                className={cn(
                  "block rounded-2xl border px-4 py-3 transition",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-slate-950 shadow-[0_12px_30px_rgba(199,100,45,0.12)]"
                    : "border-transparent text-slate-950 hover:border-[var(--line)] hover:bg-[var(--surface-muted)]",
                )}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--foreground-soft)]">
                  {item.description}
                </p>
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
            <p className="font-semibold text-slate-950">Für Live-Demos</p>
            <p className="mt-2">
              Zeigen Sie zuerst das Dashboard, dann eine Anfrage im Detail und zum Schluss
              die Preiseinstellungen.
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
