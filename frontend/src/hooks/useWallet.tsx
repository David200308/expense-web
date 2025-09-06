import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { appKit, wagmiConfig } from '@/config/walletConnect'

const queryClient = new QueryClient()

interface WalletContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signMessage: (message: string) => Promise<string>
  isConnected: boolean
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      
      // Open WalletConnect modal
      await appKit.open()
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await appKit.disconnect()
      setAccount(null)
      setProvider(null)
      setSigner(null)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }
    return await signer.signMessage(message)
  }

  const isConnected = !!account

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const provider = appKit.getProvider('eip155')
        if (provider) {
          const ethersProvider = new ethers.BrowserProvider(provider as any)
          const signer = await ethersProvider.getSigner()
          const address = await signer.getAddress()
          
          setProvider(ethersProvider)
          setSigner(signer)
          setAccount(address)
        }
      } catch (error) {
        console.error('Failed to check connection:', error)
      }
    }

    checkConnection()

    // Listen for account changes
    appKit.subscribeProviders((providers) => {
      const provider = providers.eip155
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider as any)
        setProvider(ethersProvider)
        
        ethersProvider.getSigner().then(signer => {
          setSigner(signer)
          signer.getAddress().then(address => {
            setAccount(address)
          })
        })
      } else {
        setAccount(null)
        setProvider(null)
        setSigner(null)
      }
    })
  }, [])

  const value: WalletContextType = {
    account,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    signMessage,
    isConnected,
    isLoading
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletContext.Provider value={value}>
          {children}
        </WalletContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}