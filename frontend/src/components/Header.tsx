import React from 'react'
import { Wallet } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'

const Header: React.FC = () => {
  const { account, isConnected } = useWallet()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Welcome back!</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Wallet className="h-4 w-4" />
              <span>
                {isConnected && account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : 'Not connected'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
