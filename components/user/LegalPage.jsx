import Link from 'next/link';

const LINKS = [
  { href: '/contact', label: 'Contact' },
  { href: '/shipping', label: 'Shipping' },
  { href: '/returns', label: 'Returns' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function policyParagraphs(body) {
  return String(body || '')
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function PolicyLinks() {
  return (
    <nav className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/8 pt-6 text-sm" aria-label="Policies">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="text-neutral-600 underline-offset-2 hover:text-neutral-950 hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function updatedLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LegalPage({ policy, lead }) {
  if (!policy?.body) {
    return <p className="px-4 py-16 text-center">This page is temporarily unavailable. Please try again.</p>;
  }
  const updated = updatedLabel(policy.updatedAt);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">{policy.title}</h1>
      {policy.summary ? <p className="mt-4 text-sm leading-relaxed text-neutral-600">{policy.summary}</p> : null}
      {lead ? <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-700">{lead}</div> : null}
      <div className="mt-4 space-y-4">
        {policyParagraphs(policy.body).map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-neutral-700">
            {paragraph}
          </p>
        ))}
      </div>
      {updated ? <p className="mt-8 text-xs text-neutral-400">Updated {updated}</p> : null}
      <PolicyLinks />
    </article>
  );
}
