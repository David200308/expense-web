import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { TimeSeriesData } from '@/services/analysisService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  formatAmount: (amount: number) => string
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, formatAmount }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    )
  }

  const chartData = {
    labels: data.map(item => {
      // Format the period for display
      if (item.period.includes('-')) {
        const [year, month] = item.period.split('-')
        return `${year}-${month.padStart(2, '0')}`
      }
      return item.period
    }),
    datasets: [
      {
        label: 'Total Amount',
        data: data.map(item => item.totalAmount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Transaction Count',
        data: data.map(item => item.count),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Amount: ${formatAmount(context.parsed.y)}`
            } else {
              return `Count: ${context.parsed.y} transactions`
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Period'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Amount'
        },
        ticks: {
          callback: function(value: any) {
            return formatAmount(value)
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Count'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default TimeSeriesChart
