import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Wallet, AlertCircle } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/useAuth'

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const { connectWallet, isConnected, isLoading: walletLoading } = useWallet()
  const { login, isLoading: authLoading, isAuthenticated, user, token } = useAuth()

  const isLoading = walletLoading || authLoading

  console.log('Login component render - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', token)

  if (isAuthenticated) {
    console.log('Redirecting to dashboard...')
    return <Navigate to="/dashboard" replace />
  }

  const handleConnectAndLogin = async () => {
    try {
      setError(null)
      console.log('Starting login process...')
      
      if (!isConnected) {
        console.log('Connecting wallet...')
        await connectWallet()
        console.log('Wallet connected')
      }
      
      console.log('Starting authentication...')
      await login()
      console.log('Authentication completed')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-primary-100">
            <Wallet className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Web3 wallet to access the expense tracker
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <button
              onClick={handleConnectAndLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
                  {isConnected ? 'Sign Message & Login' : 'Connect Wallet & Login'}
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              <br />
              We only use your wallet address for authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
