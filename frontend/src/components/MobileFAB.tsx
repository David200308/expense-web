import React from 'react'
import { Plus } from 'lucide-react'

interface MobileFABProps {
  onClick: () => void
  label?: string
}

const MobileFAB: React.FC<MobileFABProps> = ({ onClick, label = "Add" }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}

export default MobileFAB
