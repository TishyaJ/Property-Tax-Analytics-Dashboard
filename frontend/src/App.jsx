import { useState } from 'react'
import TenantFilter from './components/TenantFilter'
import KPICard from './components/KPICard'
import ComparisonChart from './components/ComparisonChart'
import ChatWindow from './components/ChatWindow'
import { useKPIs, useChartData } from './hooks/usePropertyData'

const KPI_CONFIG = [
  { key: 'total_registered', label: 'Total Registered', icon: '🏠', accent: 'border-teal-400', iconBg: 'bg-teal-900/40', textColor: 'text-teal-300' },
  { key: 'total_approved', label: 'Total Approved', icon: '✅', accent: 'border-emerald-400', iconBg: 'bg-emerald-900/40', textColor: 'text-emerald-300' },
  { key: 'total_rejected', label: 'Total Rejected', icon: '❌', accent: 'border-rose-400', iconBg: 'bg-rose-900/40', textColor: 'text-rose-300' },
  { key: 'total_collection_inr', label: 'Total Collection', icon: '₹', accent: 'border-amber-400', iconBg: 'bg-amber-900/40', textColor: 'text-amber-300' },
]

export default function App() {
  const [tenant, setTenant] = useState('All')
  const { kpis, loading: kpiLoading } = useKPIs(tenant)
  const { chartData } = useChartData()

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderBottom: '1px solid #1e3a5f' }}
        className="px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
              🏛️
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                UPYOG Property Tax Analytics
              </h1>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                Multi-Tenant Dashboard · 10 Indian Cities · 1,000 Records
              </p>
            </div>
          </div>
          <TenantFilter value={tenant === 'All' ? 'All Cities' : tenant} onChange={setTenant} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── KPI Cards ── */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiLoading
              ? [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: '#1e293b' }} />
              ))
              : KPI_CONFIG.map(cfg => (
                <KPICard
                  key={cfg.key}
                  label={cfg.label}
                  value={kpis?.[cfg.key] ?? 0}
                  icon={cfg.icon}
                  accent={cfg.accent}
                  iconBg={cfg.iconBg}
                  textColor={cfg.textColor}
                  isCollection={cfg.key === 'total_collection_inr'}
                />
              ))
            }
          </div>
        </section>

        {/* ── Chart + Chat ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonChart data={chartData} />
          <ChatWindow />
        </section>

      </main>

      <footer className="text-center py-4 text-xs" style={{ color: '#334155' }}>
        NUDM Intern Assessment 2026 — UPYOG Platform
      </footer>
    </div>
  )
}
