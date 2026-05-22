import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Palette matched to dark theme
const COLORS = {
    approved: { bg: 'rgba(45, 212, 191, 0.85)', border: '#2dd4bf' },  // teal
    rejected: { bg: 'rgba(251, 113, 133, 0.85)', border: '#fb7185' },  // rose
    pending: { bg: 'rgba(251, 191, 36, 0.85)', border: '#fbbf24' },  // amber
}

export default function ComparisonChart({ data }) {
    if (!data) return (
        <div className="rounded-2xl flex items-center justify-center h-[420px]"
            style={{ background: '#1e293b' }}>
            <p className="text-sm" style={{ color: '#475569' }}>Loading chart…</p>
        </div>
    )

    const chartData = {
        labels: data.map(d => d.city),
        datasets: [
            {
                label: 'Approved',
                data: data.map(d => d.approved),
                backgroundColor: COLORS.approved.bg,
                borderColor: COLORS.approved.border,
                borderWidth: 1,
                borderRadius: 5,
            },
            {
                label: 'Rejected',
                data: data.map(d => d.rejected),
                backgroundColor: COLORS.rejected.bg,
                borderColor: COLORS.rejected.border,
                borderWidth: 1,
                borderRadius: 5,
            },
            {
                label: 'Pending',
                data: data.map(d => d.pending),
                backgroundColor: COLORS.pending.bg,
                borderColor: COLORS.pending.border,
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12, padding: 16 },
            },
            title: {
                display: true,
                text: 'Property Status — All Cities',
                color: '#e2e8f0',
                font: { size: 14, weight: '600' },
                padding: { bottom: 16 },
            },
            tooltip: {
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderWidth: 1,
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                callbacks: {
                    afterBody: items => {
                        const idx = items[0].dataIndex
                        return [`Collection: ₹${data[idx].total_collection.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`]
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { color: '#1e293b' },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { color: '#1e293b' },
            },
        },
    }

    return (
        <div className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #162032 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ height: '370px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    )
}
