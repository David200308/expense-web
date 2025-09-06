import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { expenseService } from '@/services/expenseService'
import { Expense } from '@/types'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { formatDate } from '@/utils'

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { formatAmount, isLoading: currencyLoading } = useCurrency()

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await expenseService.getExpenses()
        setExpenses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch expenses')
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, expense) => {
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Expenses</p>
              <p className="text-lg font-semibold text-gray-900">{formatAmount(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">This Month</p>
              <p className="text-lg font-semibold text-gray-900">{formatAmount(thisMonthExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Expenses</h2>
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">No expenses yet. Add your first expense!</p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const categoryIcon = getCategoryIcon(expense.category)
              return (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {React.createElement(categoryIcon.icon, {
                        className: `h-4 w-4 ${categoryIcon.color}`
                      })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-semibold text-gray-900 text-sm">{formatAmount(expense.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
