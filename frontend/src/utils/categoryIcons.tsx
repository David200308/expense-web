import React from 'react'
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Heart, 
  Plane, 
  BookOpen, 
  MoreHorizontal 
} from 'lucide-react'

export interface CategoryIcon {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  'Food & Dining': {
    name: 'Food & Dining',
    icon: Utensils,
    color: 'text-orange-500'
  },
  'Transportation': {
    name: 'Transportation',
    icon: Car,
    color: 'text-blue-500'
  },
  'Shopping': {
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-purple-500'
  },
  'Entertainment': {
    name: 'Entertainment',
    icon: Film,
    color: 'text-pink-500'
  },
  'Bills & Utilities': {
    name: 'Bills & Utilities',
    icon: Zap,
    color: 'text-yellow-500'
  },
  'Healthcare': {
    name: 'Healthcare',
    icon: Heart,
    color: 'text-red-500'
  },
  'Travel': {
    name: 'Travel',
    icon: Plane,
    color: 'text-cyan-500'
  },
  'Education': {
    name: 'Education',
    icon: BookOpen,
    color: 'text-green-500'
  },
  'Other': {
    name: 'Other',
    icon: MoreHorizontal,
    color: 'text-gray-500'
  }
}

export const getCategoryIcon = (category: string): CategoryIcon => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other']
}

export const CATEGORIES = Object.keys(CATEGORY_ICONS)
