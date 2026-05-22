const TENANTS = [
    'All Cities',
    'Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Chennai',
    'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow',
]

export default function TenantFilter({ value, onChange }) {
    return (
        <div className="flex items-center gap-3">
            <label htmlFor="tenant-select" className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: '#94a3b8' }}>
                Filter by City
            </label>
            <select
                id="tenant-select"
                value={value}
                onChange={e => onChange(e.target.value === 'All Cities' ? 'All' : e.target.value)}
                className="rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2"
                style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#e2e8f0',
                    focusRingColor: '#14b8a6',
                }}
            >
                {TENANTS.map(t => (
                    <option key={t} value={t} style={{ background: '#1e293b', color: '#e2e8f0' }}>
                        {t}
                    </option>
                ))}
            </select>
        </div>
    )
}
