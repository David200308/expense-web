import React, { useState, useEffect } from 'react'
import { Calendar, BarChart3, PieChart, TrendingUp, Filter, Download } from 'lucide-react'
import { analysisService, AnalysisFilters, AnalysisReport } from '@/services/analysisService'
import { useCurrency } from '@/contexts/CurrencyContext'
import useMobile from '@/hooks/useMobile'
import CategoryChart from '@/components/analysis/CategoryChart'
import TimeSeriesChart from '@/components/analysis/TimeSeriesChart'
import AnalysisSummary from '@/components/analysis/AnalysisSummary'
import AnalysisFiltersComponent from '@/components/analysis/AnalysisFilters'

const Analysis: React.FC = () => {
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AnalysisFilters>({
    groupBy: 'month'
  })
  const [showFilters, setShowFilters] = useState(false)
  const { formatAmount, isLoading: currencyLoading } = useCurrency()
  const isMobile = useMobile()

  useEffect(() => {
    fetchAnalysisReport()
  }, [filters])

  const fetchAnalysisReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analysisService.getAnalysisReport(filters)
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis data')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: AnalysisFilters) => {
    setFilters(newFilters)
  }

  const handleExportData = () => {
    if (!report || !report.timeSeriesData) return

    const csvData = [
      ['Period', 'Total Amount', 'Count', 'Average Amount'],
      ...(report.timeSeriesData || []).map(item => [
        item.period,
        item.totalAmount.toString(),
        item.count.toString(),
        item.averageAmount.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-analysis-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading || currencyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4">
      <div className="pt-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analysis Report</h1>
            <p className="text-sm text-gray-600">Comprehensive analysis of your expense data</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center space-x-1 px-3 py-2 text-sm ${
                showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {report && (
              <button
                onClick={handleExportData}
                className="btn-secondary flex items-center space-x-1 px-3 py-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <AnalysisFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <AnalysisSummary report={report} formatAmount={formatAmount} />

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Time Series Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Spending Over Time
                </h2>
                <div className="text-sm text-gray-500">
                  Grouped by {filters.groupBy}
                </div>
              </div>
              <TimeSeriesChart data={report.timeSeriesData || []} formatAmount={formatAmount} />
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Category Breakdown
                </h2>
                <div className="text-sm text-gray-500">
                  {report.categoryBreakdown?.length || 0} categories
                </div>
              </div>
              <CategoryChart data={report.categoryBreakdown || []} formatAmount={formatAmount} />
            </div>

            {/* Trends */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trends & Insights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Period over Period Change</div>
                  <div className={`text-2xl font-bold ${report.trends.periodOverPeriod >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {report.trends.periodOverPeriod >= 0 ? '+' : ''}{report.trends.periodOverPeriod.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Top Category</div>
                  <div className="text-lg font-semibold text-gray-900">{report.trends.topCategory || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{formatAmount(report.trends.topCategoryAmount)}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Average per Transaction</div>
                  <div className="text-2xl font-bold text-gray-900">{formatAmount(report.summary.averageAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Add some expenses to see your analysis report.</p>
        </div>
      )}
    </div>
  )
}

export default Analysis
