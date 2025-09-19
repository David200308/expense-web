import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Receipt, Clock, BarChart3, Settings, LineChart, Globe } from 'lucide-react'

const MobileBottomNav: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Investments', href: '/investments', icon: LineChart },
    { name: 'Tasks', href: '/tasks', icon: Clock },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileBottomNav
