import { useState } from 'react'
import TenantFilter from './components/TenantFilter'
import KPICard from './components/KPICard'
import ComparisonChart from './components/ComparisonChart'
import ChatWindow from './components/ChatWindow'
import { useKPIs, useChartData } from './hooks/usePropertyData'

const KPI_CONFIG = [
  { key: 'total_registered', label: 'Total Registered' },
  { key: 'total_approved', label: 'Total Approved' },
  { key: 'total_rejected', label: 'Total Rejected' },
  { key: 'total_collection_inr', label: 'Total Collection', isCollection: true },
]

export default function App() {
  const [tenant, setTenant] = useState('All')
  const { kpis, loading: kpiLoading } = useKPIs(tenant)
  const { chartData } = useChartData()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              UPYOG Property Tax Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Tenant Dashboard · 10 Indian Cities · 1,000 Records
            </p>
          </div>
          <TenantFilter value={tenant === 'All' ? 'All Cities' : tenant} onChange={setTenant} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* KPI Cards */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiLoading
              ? [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl h-28 bg-slate-200 animate-pulse" />
              ))
              : KPI_CONFIG.map(cfg => (
                <KPICard
                  key={cfg.key}
                  label={cfg.label}
                  value={kpis?.[cfg.key] ?? 0}
                  isCollection={!!cfg.isCollection}
                />
              ))
            }
          </div>
        </section>

        {/* Chart + Chat */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonChart data={chartData} />
          <ChatWindow />
        </section>

      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        NUDM Intern Assessment 2026 — UPYOG Platform
      </footer>
    </div>
  )
}
