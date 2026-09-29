'use client';

export default function Pagination({ current = 1, total = 5, onChange }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange?.(p)}
          className={`w-10 h-10 rounded-lg ${p === current ? 'bg-black text-white' : 'bg-white border'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}