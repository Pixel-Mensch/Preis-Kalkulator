type ConfigurationStateProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  actionHint?: string;
};

export function ConfigurationState({
  title,
  description,
  eyebrow = "Einrichtung unvollständig",
  actionLabel = "Nächster Schritt",
  actionHint = "Bitte Firmendaten und Preislogik vervollständigen, damit die öffentliche Anfrage wieder sauber freigegeben werden kann.",
}: ConfigurationStateProps) {
  return (
    <section className="panel mx-auto max-w-3xl rounded-[2rem] p-6 sm:p-8">
      <p className="eyebrow text-[var(--accent-deep)]">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">{description}</p>
      <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">{actionLabel}</p>
        <p className="mt-2">{actionHint}</p>
      </div>
    </section>
  );
}
