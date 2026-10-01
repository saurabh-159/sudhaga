import Link from 'next/link';

export default function Pagination({ current = 1, total = 1, hrefFor }) {
  if (!total || total <= 1 || typeof hrefFor !== 'function') return null;

  return (
    <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === current ? 'page' : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            p === current ? 'bg-black text-white' : 'border bg-white'
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
