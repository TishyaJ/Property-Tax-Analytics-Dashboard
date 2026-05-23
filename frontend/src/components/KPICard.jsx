export default function KPICard({ label, value, isCollection }) {
    const formatted = typeof value === 'number'
        ? isCollection
            ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : value.toLocaleString('en-IN')
        : '—'

    return (
        <div className="bg-white rounded-2xl p-5 border-l-4 border-violet-900 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="text-2xl font-bold mt-2 text-slate-800">
                {formatted}
            </p>
        </div>
    )
}
