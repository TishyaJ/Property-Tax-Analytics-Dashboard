/**
 * ComparisonChart — Grouped Bar Chart (Approved / Rejected / Pending) per city.
 * Uses Chart.js via react-chartjs-2.
 */
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ComparisonChart({ data }) {
    if (!data) return <div className="text-center text-gray-400 py-10">Loading chart…</div>

    const labels = data.map(d => d.city)

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Approved',
                data: data.map(d => d.approved),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 4,
            },
            {
                label: 'Rejected',
                data: data.map(d => d.rejected),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: 4,
            },
            {
                label: 'Pending',
                data: data.map(d => d.pending),
                backgroundColor: 'rgba(234, 179, 8, 0.8)',
                borderRadius: 4,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Property Status Comparison Across All Cities',
                font: { size: 15, weight: 'bold' },
            },
            tooltip: {
                callbacks: {
                    afterBody: (items) => {
                        const idx = items[0].dataIndex
                        return [`Total Collection: ₹${data[idx].total_collection.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`]
                    },
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-5">
            <div style={{ height: '380px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    )
}
