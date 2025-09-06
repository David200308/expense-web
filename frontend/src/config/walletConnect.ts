import { createAppKit } from '@reown/appkit/react'
import { arbitrum, mainnet, polygon, sepolia } from 'viem/chains'

// Get project ID from environment or runtime config
const projectId = (window as any).APP_CONFIG?.WALLETCONNECT_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id'

// Create metadata
const metadata = {
  name: 'Expense Tracker',
  description: 'Track your expenses with Web3 authentication',
  url: 'https://expense.skyproton.com',
  icons: ['https://expense.skyproton.com/favicon.ico']
}

// Create appKit configuration
export const appKit = createAppKit({
  projectId,
  networks: [mainnet, arbitrum, polygon, sepolia],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
    email: false
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00BB7F',
    '--w3m-color-mix-strength': 40
  }
})

export const wagmiConfig = (appKit as any).wagmiConfig
