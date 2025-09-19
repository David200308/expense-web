import React, { useState } from 'react'

const Investments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks')

  const tabs = [
    { key: 'stocks' as const, label: 'Stocks' },
    { key: 'crypto' as const, label: 'Crypto' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <p className="text-gray-600 mt-1">Track and analyze your stock and crypto holdings.</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={
                  `whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors ` +
                  (activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'stocks' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Stocks</h2>
              <p className="text-gray-600">Coming soon: link broker accounts, track positions, P/L, and charts.</p>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Crypto</h2>
              <p className="text-gray-600">Coming soon: connect wallets/exchanges, track coins, P/L, and charts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Investments



