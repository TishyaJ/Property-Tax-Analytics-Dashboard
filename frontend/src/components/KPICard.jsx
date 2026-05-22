export default function KPICard({ label, value, icon, accent, iconBg, textColor, isCollection }) {
    const formatted = typeof value === 'number'
        ? isCollection
            ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : value.toLocaleString('en-IN')
        : '—'

    return (
        <div
            className={`rounded-2xl p-5 border-l-4 ${accent} flex items-center gap-4`}
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #162032 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${iconBg}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider truncate" style={{ color: '#64748b' }}>
                    {label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${textColor}`}>
                    {formatted}
                </p>
            </div>
        </div>
    )
}
