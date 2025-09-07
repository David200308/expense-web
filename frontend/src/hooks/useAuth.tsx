import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { authService } from '@/services/authService'
import { User, AuthResponse } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: () => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { account, signMessage, isConnected } = useWallet()

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token and get user info
      authService.verifyToken(storedToken)
        .then((userData: User) => {
          setUser(userData)
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async () => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected')
    }

    try {
      setIsLoading(true)
      
      // Get nonce from backend
      const { nonce } = await authService.getNonce(account)
      console.log('Got nonce:', nonce)
      
      // Create message to sign
      const message = `Sign this message to authenticate with Expense Tracker.\n\nNonce: ${nonce}`
      
      // Sign the message
      const signature = await signMessage(message)
      console.log('Message signed successfully')
      
      // Send to backend for verification
      const response: AuthResponse = await authService.login({
        walletAddress: account,
        signature,
        message
      })
      
      console.log('Login response:', response)
      
      // Store token and user data
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('auth_token', response.token)
      
      console.log('User authenticated successfully')
      
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
