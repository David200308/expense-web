import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { CreateExpenseRequest } from '@/types'
import { CATEGORIES, getCategoryIcon } from '@/utils/categoryIcons'

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseRequest) => void
  onCancel: () => void
  initialData?: Partial<CreateExpenseRequest>
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Partial<CreateExpenseRequest>>({})

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown])

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateExpenseRequest> = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof CreateExpenseRequest]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Enter expense description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {formData.category ? (
                    <>
                      {React.createElement(getCategoryIcon(formData.category).icon, {
                        className: `h-4 w-4 ${getCategoryIcon(formData.category).color}`
                      })}
                      <span>{formData.category}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select a category</span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    showCategoryDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {CATEGORIES.map(category => {
                    const categoryIcon = getCategoryIcon(category)
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category }))
                          setShowCategoryDropdown(false)
                          if (errors.category) {
                            setErrors(prev => ({ ...prev, category: undefined }))
                          }
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        {React.createElement(categoryIcon.icon, {
                          className: `h-4 w-4 ${categoryIcon.color}`
                        })}
                        <span>{category}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`input-field ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialData ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm
