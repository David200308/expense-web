import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'

export interface Currency {
  code: string
  name: string
  symbol: string
  decimalPlaces: number
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2 },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => Promise<void>
  formatAmount: (amount: number | string) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

interface CurrencyProviderProps {
  children: ReactNode
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]) // Default to USD
  const [isLoading, setIsLoading] = useState(true) // Start with loading state
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const loadUserCurrency = async () => {
      if (!isAuthenticated || !user) {
        // If not authenticated, try to load from localStorage as fallback
        const savedCurrency = localStorage.getItem('selected_currency')
        if (savedCurrency) {
          try {
            const parsedCurrency = JSON.parse(savedCurrency)
            const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code)
            if (foundCurrency) {
              setCurrencyState(foundCurrency)
            }
          } catch (parseError) {
            console.error('Failed to parse saved currency:', parseError)
          }
        }
        setIsLoading(false)
        return
      }

      try {
        // Use user data from auth context if available
        const foundCurrency = CURRENCIES.find(c => c.code === user.currency)
        if (foundCurrency) {
          setCurrencyState(foundCurrency)
        }
      } catch (error) {
        console.error('Failed to load user currency:', error)
        // Fallback to localStorage if available
        const savedCurrency = localStorage.getItem('selected_currency')
        if (savedCurrency) {
          try {
            const parsedCurrency = JSON.parse(savedCurrency)
            const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code)
            if (foundCurrency) {
              setCurrencyState(foundCurrency)
            }
          } catch (parseError) {
            console.error('Failed to parse saved currency:', parseError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserCurrency()
  }, [isAuthenticated, user])

  const handleSetCurrency = async (newCurrency: Currency) => {
    try {
      setIsLoading(true)
      setCurrencyState(newCurrency)
      
      // Save to database
      const token = localStorage.getItem('auth_token')
      if (token) {
        await authService.updateProfile({ currency: newCurrency.code })
      }
      
      // Also save to localStorage as fallback
      localStorage.setItem('selected_currency', JSON.stringify(newCurrency))
    } catch (error) {
      console.error('Failed to update currency:', error)
      // Revert on error
      const savedCurrency = localStorage.getItem('selected_currency')
      if (savedCurrency) {
        try {
          const parsedCurrency = JSON.parse(savedCurrency)
          const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code)
          if (foundCurrency) {
            setCurrencyState(foundCurrency)
          }
        } catch (parseError) {
          console.error('Failed to revert currency:', parseError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) {
      return `${currency.symbol}0.00`
    }
    return `${currency.symbol}${numAmount.toFixed(currency.decimalPlaces)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatAmount, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}
