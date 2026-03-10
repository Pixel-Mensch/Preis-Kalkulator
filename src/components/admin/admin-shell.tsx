import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  adminName: string;
  children: ReactNode;
};

const navigationItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/anfragen", label: "Anfragen" },
  { href: "/admin/preise", label: "Preise" },
  { href: "/admin/firma", label: "Firma" },
] as const;

export function AdminShell({ adminName, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="panel rounded-[2rem] p-5 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-3xl bg-[var(--surface-muted)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-deep)]">
              Admin
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{adminName}</p>
          </div>

          <nav className="mt-5 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-[var(--surface-muted)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
