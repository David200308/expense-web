import React from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface MobileHeaderProps {
  onMenuClick: () => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* App Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Expense Tracker</h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User Avatar */}
          <div className="p-2 rounded-full bg-primary-100 text-primary-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default MobileHeader
