import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const COLORS = {
    approved: { bg: 'rgba(79, 70, 229, 0.8)', border: '#4f46e5' },  // indigo
    rejected: { bg: 'rgba(244, 63, 94, 0.8)', border: '#f43f5e' },  // rose
    pending: { bg: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },  // amber
}

export default function ComparisonChart({ data }) {
    if (!data) return (
        <div className="bg-white rounded-2xl shadow-sm flex items-center justify-center h-[420px]">
            <p className="text-sm text-slate-400">Loading chart…</p>
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
                borderRadius: 4,
            },
            {
                label: 'Rejected',
                data: data.map(d => d.rejected),
                backgroundColor: COLORS.rejected.bg,
                borderColor: COLORS.rejected.border,
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Pending',
                data: data.map(d => d.pending),
                backgroundColor: COLORS.pending.bg,
                borderColor: COLORS.pending.border,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#475569', font: { size: 12 }, boxWidth: 12, padding: 16 },
            },
            title: {
                display: true,
                text: 'Property Status — All Cities',
                color: '#1e293b',
                font: { size: 14, weight: '600' },
                padding: { bottom: 16 },
            },
            tooltip: {
                backgroundColor: '#fff',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                titleColor: '#1e293b',
                bodyColor: '#475569',
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
                ticks: { color: '#94a3b8', font: { size: 11 } },
                border: { color: '#e2e8f0' },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                border: { color: '#e2e8f0' },
            },
        },
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <div style={{ height: '370px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    )
}
