import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { AnalysisFilters } from '@/services/analysisService'

interface AnalysisFiltersProps {
  filters: AnalysisFilters
  onFiltersChange: (filters: AnalysisFilters) => void
  onClose: () => void
}

const AnalysisFiltersComponent: React.FC<AnalysisFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<AnalysisFilters>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClear = () => {
    const clearedFilters: AnalysisFilters = {
      groupBy: 'month'
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onClose()
  }

  const handleFilterChange = (key: keyof AnalysisFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Filter Analysis</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group By
          </label>
          <select
            value={localFilters.groupBy || 'month'}
            onChange={(e) => handleFilterChange('groupBy', e.target.value)}
            className="input-field text-sm"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quick Filters
          </label>
          <div className="space-y-1">
            <button
              onClick={() => {
                const today = new Date()
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                setLocalFilters(prev => ({
                  ...prev,
                  startDate: lastMonth.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                }))
              }}
              className="w-full text-left px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
                setLocalFilters(prev => ({
                  ...prev,
                  startDate: last3Months.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                }))
              }}
              className="w-full text-left px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
                setLocalFilters(prev => ({
                  ...prev,
                  startDate: lastYear.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                }))
              }}
              className="w-full text-left px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
            >
              Last Year
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="btn-primary px-4 py-2 text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export default AnalysisFiltersComponent
