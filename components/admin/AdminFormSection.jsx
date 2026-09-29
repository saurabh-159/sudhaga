export default function AdminFormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] md:p-6">
      {(title || description) && (
        <div className="mb-5 border-b border-black/6 pb-4">
          {title ? (
            <h2 className="text-base font-semibold tracking-tight text-neutral-950">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
