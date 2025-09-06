import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Expense } from '@/types'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { formatDate } from '@/utils'

interface MobileExpenseCardProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const MobileExpenseCard: React.FC<MobileExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete
}) => {
  const { formatAmount } = useCurrency()
  const categoryIcon = getCategoryIcon(expense.category)

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {React.createElement(categoryIcon.icon, {
              className: `h-5 w-5 ${categoryIcon.color}`
            })}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {expense.description}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{expense.category}</p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(expense.date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">
              {formatAmount(expense.amount)}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(expense)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileExpenseCard
