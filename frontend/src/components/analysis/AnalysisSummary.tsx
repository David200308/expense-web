import React from 'react'
import { DollarSign, Receipt, TrendingUp, Calendar } from 'lucide-react'
import { AnalysisReport } from '@/services/analysisService'

interface AnalysisSummaryProps {
  report: AnalysisReport
  formatAmount: (amount: number) => string
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ report, formatAmount }) => {
  const { summary } = report

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">{formatAmount(summary.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Receipt className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900">{summary.totalExpenses}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Average Amount</p>
            <p className="text-lg font-semibold text-gray-900">{formatAmount(summary.averageAmount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Period</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{summary.period}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisSummary
