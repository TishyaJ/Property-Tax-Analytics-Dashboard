/**
 * Fetches KPI and chart data from the FastAPI backend.
 * Falls back to computing directly from the local JSON if the backend is unreachable.
 */
import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export function useKPIs(tenant) {
    const [kpis, setKpis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchKPIs = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BASE}/api/kpis?tenant=${encodeURIComponent(tenant)}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            setKpis(await res.json())
        } catch (err) {
            setError(err.message)
            // Fallback: compute from local JSON
            try {
                const raw = await fetch('/properties.json')
                const data = await raw.json()
                const filtered = tenant === 'All' ? data : data.filter(r => r.tenant === tenant)
                setKpis({
                    total_registered: filtered.length,
                    total_approved: filtered.filter(r => r.status === 'Approved').length,
                    total_rejected: filtered.filter(r => r.status === 'Rejected').length,
                    total_collection_inr: filtered.reduce((s, r) => s + r.collection_inr, 0),
                })
                setError(null)
            } catch {
                // keep original error
            }
        } finally {
            setLoading(false)
        }
    }, [tenant])

    useEffect(() => { fetchKPIs() }, [fetchKPIs])
    return { kpis, loading, error }
}

export function useChartData() {
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/chart-data`)
                if (!res.ok) throw new Error()
                setChartData(await res.json())
            } catch {
                // Fallback
                const raw = await fetch('/properties.json')
                const data = await raw.json()
                const cities = ['Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow']
                setChartData(cities.map(city => {
                    const r = data.filter(d => d.tenant === city)
                    return {
                        city,
                        approved: r.filter(d => d.status === 'Approved').length,
                        rejected: r.filter(d => d.status === 'Rejected').length,
                        pending: r.filter(d => d.status === 'Pending').length,
                        total_collection: r.reduce((s, d) => s + d.collection_inr, 0),
                    }
                }))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return { chartData, loading }
}

export async function fetchSummary() {
    try {
        const res = await fetch(`${API_BASE}/api/summary`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        return json.summary
    } catch {
        // Fallback: build summary from local JSON
        const raw = await fetch('/properties.json')
        const data = await raw.json()
        const cities = ['Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow']
        const lines = [`UPYOG Property Tax Dashboard — Data Summary`, `Total records: ${data.length}`, '']
        for (const city of cities) {
            const r = data.filter(d => d.tenant === city)
            const approved = r.filter(d => d.status === 'Approved').length
            const rejected = r.filter(d => d.status === 'Rejected').length
            const pending = r.filter(d => d.status === 'Pending').length
            const collection = r.reduce((s, d) => s + d.collection_inr, 0)
            lines.push(`${city}: total=${r.length}, approved=${approved}, rejected=${rejected}, pending=${pending}, collection=Rs.${collection.toFixed(2)}`)
        }
        return lines.join('\n')
    }
}
