export default function DashboardCard({ title, value, icon: Icon, color = 'bg-neutral-900' }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</p>
          <p className="mt-2 break-words text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">{value}</p>
        </div>
        {Icon ? (
          <div className={`${color} rounded-xl p-2.5 text-white`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
