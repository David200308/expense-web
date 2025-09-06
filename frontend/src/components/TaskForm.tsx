import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES, getCategoryIcon } from '@/utils/categoryIcons'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

interface TaskFormData {
  title: string
  description: string
  amount: number
  category: string
  schedule: string
  is_active: boolean
}

const SCHEDULE_OPTIONS = [
  { value: '0 9 * * 1', label: 'Every Monday at 9:00 AM' },
  { value: '0 9 * * 2', label: 'Every Tuesday at 9:00 AM' },
  { value: '0 9 * * 3', label: 'Every Wednesday at 9:00 AM' },
  { value: '0 9 * * 4', label: 'Every Thursday at 9:00 AM' },
  { value: '0 9 * * 5', label: 'Every Friday at 9:00 AM' },
  { value: '0 9 * * 6', label: 'Every Saturday at 9:00 AM' },
  { value: '0 9 * * 0', label: 'Every Sunday at 9:00 AM' },
  { value: '0 9 * * *', label: 'Every day at 9:00 AM' },
  { value: '0 9 1 * *', label: 'Every month on the 1st at 9:00 AM' },
]

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    amount: 0,
    category: '',
    schedule: '0 9 * * 1',
    is_active: true
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const scheduleDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
      if (scheduleDropdownRef.current && !scheduleDropdownRef.current.contains(event.target as Node)) {
        setShowScheduleDropdown(false)
      }
    }

    if (showCategoryDropdown || showScheduleDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown, showScheduleDropdown])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.schedule) {
      newErrors.schedule = 'Schedule is required'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof TaskFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const getScheduleLabel = (value: string) => {
    const option = SCHEDULE_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <div className="relative" ref={categoryDropdownRef}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule *
            </label>
            <div className="relative" ref={scheduleDropdownRef}>
              <button
                type="button"
                onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.schedule ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span>{getScheduleLabel(formData.schedule)}</span>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    showScheduleDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showScheduleDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {SCHEDULE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, schedule: option.value }))
                        setShowScheduleDropdown(false)
                        if (errors.schedule) {
                          setErrors(prev => ({ ...prev, schedule: undefined }))
                        }
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.schedule && (
              <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Activate task immediately
            </label>
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
