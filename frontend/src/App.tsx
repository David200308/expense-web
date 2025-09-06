import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { WalletProvider } from '@/hooks/useWallet'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import useMobile from '@/hooks/useMobile'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Expenses from '@/pages/Expenses'
import Tasks from '@/pages/Tasks'
import Analysis from '@/pages/Analysis'
import Settings from '@/pages/Settings'
import Layout from '@/components/Layout'
import MobileLayout from '@/components/MobileLayout'

function App() {
  const isMobile = useMobile()

  return (
    <WalletProvider>
      <AuthProvider>
        <CurrencyProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={isMobile ? <MobileLayout /> : <Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="analysis" element={<Analysis />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </CurrencyProvider>
      </AuthProvider>
    </WalletProvider>
  )
}

export default App
