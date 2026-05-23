const TENANTS = [
    'All Cities',
    'Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Chennai',
    'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow',
]

export default function TenantFilter({ value, onChange }) {
    return (
        <div className="flex items-center gap-3">
            <label htmlFor="tenant-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Filter by City
            </label>
            <select
                id="tenant-select"
                value={value}
                onChange={e => onChange(e.target.value === 'All Cities' ? 'All' : e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            >
                {TENANTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
        </div>
    )
}
