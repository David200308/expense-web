import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter, X, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { expenseService } from '@/services/expenseService'
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/types'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCategoryIcon, CATEGORIES } from '@/utils/categoryIcons'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseModal from '@/components/ExpenseModal'
import MobileExpenseCard from '@/components/MobileExpenseCard'
import MobileFAB from '@/components/MobileFAB'
import useMobile from '@/hooks/useMobile'

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const { formatAmount, isLoading: currencyLoading } = useCurrency()
  const isMobile = useMobile()

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const data = await expenseService.getExpenses()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpense = async (expenseData: CreateExpenseRequest) => {
    try {
      const newExpense = await expenseService.createExpense(expenseData)
      setExpenses(prev => [newExpense, ...prev])
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense')
    }
  }

  const handleUpdateExpense = async (expenseData: UpdateExpenseRequest) => {
    try {
      const updatedExpense = await expenseService.updateExpense(expenseData)
      setExpenses(prev => prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      ))
      setEditingExpense(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await expenseService.deleteExpense(id)
      setExpenses(prev => prev.filter(expense => expense.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = filters.category === '' || expense.category === filters.category

    // Date filters
    const expenseDate = new Date(expense.date)
    const matchesDateFrom = filters.dateFrom === '' || expenseDate >= new Date(filters.dateFrom)
    const matchesDateTo = filters.dateTo === '' || expenseDate <= new Date(filters.dateTo)

    // Amount filters
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
    const matchesAmountMin = filters.amountMin === '' || amount >= parseFloat(filters.amountMin)
    const matchesAmountMax = filters.amountMax === '' || amount <= parseFloat(filters.amountMax)

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax
  })

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== ''

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      category: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    })
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page when changing filters
  }

  // Pagination calculations
  const totalFilteredItems = filteredExpenses.length
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex)

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading || currencyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4">
      <div className="pt-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-600">Manage your expense records</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center space-x-1 px-3 py-2 text-sm ${
              hasActiveFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900">Filter Expenses</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Range
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Min amount"
                      value={filters.amountMin}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                      className="input-field pl-10"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Max amount"
                      value={filters.amountMax}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                      className="input-field pl-10"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Category: {filters.category}
                      <button
                        onClick={() => handleFilterChange('category', '')}
                        className="ml-2 hover:text-green-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateFrom && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      From: {new Date(filters.dateFrom).toLocaleDateString()}
                      <button
                        onClick={() => handleFilterChange('dateFrom', '')}
                        className="ml-2 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      To: {new Date(filters.dateTo).toLocaleDateString()}
                      <button
                        onClick={() => handleFilterChange('dateTo', '')}
                        className="ml-2 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.amountMin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      Min: {formatAmount(parseFloat(filters.amountMin))}
                      <button
                        onClick={() => handleFilterChange('amountMin', '')}
                        className="ml-2 hover:text-yellow-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.amountMax && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      Max: {formatAmount(parseFloat(filters.amountMax))}
                      <button
                        onClick={() => handleFilterChange('amountMax', '')}
                        className="ml-2 hover:text-yellow-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary and Pagination Controls */}
      {filteredExpenses.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems} expenses
              {hasActiveFilters && ' (filtered)'}
            </p>
            
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Expenses List */}
      <div className={isMobile ? "space-y-3" : "card"}>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {hasActiveFilters 
                ? 'No expenses found matching your filters. Try adjusting your search criteria.' 
                : 'No expenses yet. Add your first expense!'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className={isMobile ? "space-y-3" : "space-y-4"}>
            {paginatedExpenses.map((expense) => {
              if (isMobile) {
                return (
                  <MobileExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={setEditingExpense}
                    onDelete={handleDeleteExpense}
                  />
                )
              }
              
              const categoryIcon = getCategoryIcon(expense.category)
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {React.createElement(categoryIcon.icon, {
                        className: `h-5 w-5 ${categoryIcon.color}`
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{expense.description}</h3>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatAmount(expense.amount)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleCreateExpense}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          onSave={handleUpdateExpense}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <MobileFAB
          onClick={() => setShowForm(true)}
          label="Add Expense"
        />
      )}
    </div>
  )
}

export default Expenses
