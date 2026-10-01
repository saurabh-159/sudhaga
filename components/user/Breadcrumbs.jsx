import Link from 'next/link';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500 md:text-sm">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.href}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-gray-300">
                /
              </span>
            ) : null}
            {last ? (
              <span className="max-w-[220px] truncate font-semibold text-gray-900">{item.name}</span>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-gray-900">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
