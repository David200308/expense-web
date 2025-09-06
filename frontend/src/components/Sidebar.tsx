import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Receipt, Clock, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Tasks', href: '/tasks', icon: Clock },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
        {user && (
          <p className="text-sm text-gray-600 mt-2">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </p>
        )}
      </div>
      
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4">
        <button
          onClick={logout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
