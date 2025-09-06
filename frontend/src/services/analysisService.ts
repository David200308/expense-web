import axios from 'axios'

const API_BASE_URL = (window as any).APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3020/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AnalysisFilters {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'month' | 'year'
}

export interface CategoryAnalysis {
  category: string
  totalAmount: number
  count: number
  percentage: number
  averageAmount: number
}

export interface TimeSeriesData {
  period: string
  totalAmount: number
  count: number
  averageAmount: number
}

export interface AnalysisReport {
  summary: {
    totalExpenses: number
    totalAmount: number
    averageAmount: number
    period: string
  }
  categoryBreakdown: CategoryAnalysis[]
  timeSeriesData: TimeSeriesData[]
  trends: {
    periodOverPeriod: number
    topCategory: string
    topCategoryAmount: number
  }
}

export const analysisService = {
  async getAnalysisReport(filters: AnalysisFilters): Promise<AnalysisReport> {
    const params = new URLSearchParams()
    
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.groupBy) params.append('groupBy', filters.groupBy)

    const response = await api.get(`/analysis/report?${params.toString()}`)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch analysis report')
    }
    
    return response.data.data
  },

  async getCategoryAnalysis(filters: Omit<AnalysisFilters, 'groupBy'>): Promise<{
    categories: CategoryAnalysis[]
    summary: AnalysisReport['summary']
  }> {
    const params = new URLSearchParams()
    
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const response = await api.get(`/analysis/categories?${params.toString()}`)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch category analysis')
    }
    
    return response.data.data
  },

  async getTimeSeriesData(filters: AnalysisFilters): Promise<{
    timeSeries: TimeSeriesData[]
    summary: AnalysisReport['summary']
  }> {
    const params = new URLSearchParams()
    
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.groupBy) params.append('groupBy', filters.groupBy)

    const response = await api.get(`/analysis/timeseries?${params.toString()}`)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch time series data')
    }
    
    return response.data.data
  }
}
