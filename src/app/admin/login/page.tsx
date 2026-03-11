import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const [session, resolvedSearchParams] = await Promise.all([
    getAdminSession(),
    searchParams,
  ]);

  if (session) {
    redirect("/admin");
  }

  const hasError = resolvedSearchParams.error === "invalid";

  return (
    <main className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-5 py-10 sm:px-8">
        <div className="panel w-full rounded-[2rem] p-8">
          <p className="eyebrow text-[var(--accent-deep)]">Verwaltung</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
            Geschützter Bereich
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            Bitte mit Administrator-Zugang anmelden.
          </p>

          {hasError ? (
            <div className="mt-6 rounded-3xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              Die Zugangsdaten waren ungültig.
            </div>
          ) : null}

          <form action="/admin/login/submit" method="post" className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">E-Mail</span>
              <input
                name="email"
                type="email"
                required
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">Passwort</span>
              <input
                name="password"
                type="password"
                required
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
