import Link from 'next/link';

export default function AdminPageHeader({ title, description, action }) {
  const linkAction =
    action && typeof action === 'object' && typeof action.href === 'string' ? action : null;

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>
      {linkAction ? (
        <Link
          href={linkAction.href}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {linkAction.label}
        </Link>
      ) : action ? (
        action
      ) : null}
    </div>
  );
}
