export default function LineOptions({ options = [], sku = '', className = '' }) {
  if (!options.length && !sku) return null;
  return (
    <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500 ${className}`}>
      {options.map((option) => (
        <span key={`${option.slug}-${option.value}`} className="rounded-full bg-[#f6f1ea] px-2.5 py-1">
          {option.name} {option.value}
        </span>
      ))}
      {sku ? <span className="rounded-full bg-[#f6f1ea] px-2.5 py-1">SKU {sku}</span> : null}
    </div>
  );
}
