import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Expense } from '../entities/expense.entity'

export interface AnalysisFilters {
  userId: string
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

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async generateAnalysisReport(filters: AnalysisFilters): Promise<AnalysisReport> {
    const { userId, startDate, endDate, groupBy = 'month' } = filters

    // Build date filter
    const dateFilter = this.buildDateFilter(startDate, endDate)

    // Get all expenses for the user within the date range
    const expenses = await this.expenseRepository.find({
      where: {
        userId,
        ...dateFilter,
      },
      order: { date: 'ASC' },
    })

    if (expenses.length === 0) {
      return this.getEmptyReport()
    }

    // Calculate summary
    const summary = this.calculateSummary(expenses, startDate, endDate)

    // Calculate category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(expenses)

    // Calculate time series data
    const timeSeriesData = this.calculateTimeSeriesData(expenses, groupBy)

    // Calculate trends
    const trends = this.calculateTrends(expenses, groupBy)

    return {
      summary,
      categoryBreakdown,
      timeSeriesData,
      trends,
    }
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      // Default to last 12 months
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 12)
      return {
        date: Between(start, end),
      }
    }

    if (startDate && endDate) {
      return {
        date: Between(new Date(startDate), new Date(endDate)),
      }
    }

    if (startDate) {
      return {
        date: Between(new Date(startDate), new Date()),
      }
    }

    if (endDate) {
      return {
        date: Between(new Date('1900-01-01'), new Date(endDate)),
      }
    }

    return {}
  }

  private calculateSummary(expenses: Expense[], startDate?: string, endDate?: string) {
    const totalAmount = expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    const totalExpenses = expenses.length
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0

    let period = 'All time'
    if (startDate && endDate) {
      period = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    } else if (startDate) {
      period = `From ${new Date(startDate).toLocaleDateString()}`
    } else if (endDate) {
      period = `Until ${new Date(endDate).toLocaleDateString()}`
    }

    return {
      totalExpenses,
      totalAmount,
      averageAmount,
      period,
    }
  }

  private calculateCategoryBreakdown(expenses: Expense[]): CategoryAnalysis[] {
    const categoryMap = new Map<string, { totalAmount: number; count: number }>()

    expenses.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      const validAmount = isNaN(amount) ? 0 : amount

      if (categoryMap.has(expense.category)) {
        const existing = categoryMap.get(expense.category)!
        categoryMap.set(expense.category, {
          totalAmount: existing.totalAmount + validAmount,
          count: existing.count + 1,
        })
      } else {
        categoryMap.set(expense.category, {
          totalAmount: validAmount,
          count: 1,
        })
      }
    })

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.totalAmount, 0)

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalAmount: data.totalAmount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.totalAmount / totalAmount) * 100 : 0,
        averageAmount: data.count > 0 ? data.totalAmount / data.count : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }

  private calculateTimeSeriesData(expenses: Expense[], groupBy: 'day' | 'month' | 'year'): TimeSeriesData[] {
    const groupedData = new Map<string, { totalAmount: number; count: number }>()

    expenses.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      const validAmount = isNaN(amount) ? 0 : amount

      let period: string
      const date = new Date(expense.date)

      switch (groupBy) {
        case 'day':
          period = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          period = String(date.getFullYear())
          break
        default:
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (groupedData.has(period)) {
        const existing = groupedData.get(period)!
        groupedData.set(period, {
          totalAmount: existing.totalAmount + validAmount,
          count: existing.count + 1,
        })
      } else {
        groupedData.set(period, {
          totalAmount: validAmount,
          count: 1,
        })
      }
    })

    return Array.from(groupedData.entries())
      .map(([period, data]) => ({
        period,
        totalAmount: data.totalAmount,
        count: data.count,
        averageAmount: data.count > 0 ? data.totalAmount / data.count : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  private calculateTrends(expenses: Expense[], groupBy: 'day' | 'month' | 'year') {
    const timeSeriesData = this.calculateTimeSeriesData(expenses, groupBy)
    
    if (timeSeriesData.length < 2) {
      return {
        periodOverPeriod: 0,
        topCategory: '',
        topCategoryAmount: 0,
      }
    }

    // Calculate period over period change
    const latest = timeSeriesData[timeSeriesData.length - 1]
    const previous = timeSeriesData[timeSeriesData.length - 2]
    const periodOverPeriod = previous.totalAmount > 0 
      ? ((latest.totalAmount - previous.totalAmount) / previous.totalAmount) * 100 
      : 0

    // Find top category
    const categoryBreakdown = this.calculateCategoryBreakdown(expenses)
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : { category: '', totalAmount: 0 }

    return {
      periodOverPeriod,
      topCategory: topCategory.category,
      topCategoryAmount: topCategory.totalAmount,
    }
  }

  private getEmptyReport(): AnalysisReport {
    return {
      summary: {
        totalExpenses: 0,
        totalAmount: 0,
        averageAmount: 0,
        period: 'No data available',
      },
      categoryBreakdown: [],
      timeSeriesData: [],
      trends: {
        periodOverPeriod: 0,
        topCategory: '',
        topCategoryAmount: 0,
      },
    }
  }
}
