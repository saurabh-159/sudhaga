export default function Textarea({ label, hint, className = '', rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">{label}</label>
      ) : null}
      <textarea
        rows={rows}
        className={`w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 ${className}`}
        {...props}
      />
      {hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
