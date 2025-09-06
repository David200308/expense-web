import React, { useState, useEffect } from 'react'
import { Download, Upload, Settings as SettingsIcon, DollarSign, FileText, Mail } from 'lucide-react'
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext'
import { useAuth } from '@/hooks/useAuth'
import { expenseService } from '@/services/expenseService'
import { authService } from '@/services/authService'
import { CreateExpenseRequest } from '@/types'

const Settings: React.FC = () => {
  const { currency, setCurrency, formatAmount, isLoading } = useCurrency()
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [email, setEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleEmailUpdate = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    try {
      setIsUpdatingEmail(true)
      await authService.updateProfile({ email })
      setMessage({ type: 'success', text: 'Email updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update email' })
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      const expenses = await expenseService.getExpenses()
      
      // Create CSV content
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Created At']
      const csvContent = [
        headers.join(','),
        ...expenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
          `"${expense.category}"`,
          expense.amount.toString(),
          new Date(expense.createdAt).toISOString()
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setMessage({ type: 'success', text: 'Expenses exported successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export expenses' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const templateContent = [
      'Date,Description,Category,Amount',
      '2024-01-15,Lunch at restaurant,Food & Dining,25.50',
      '2024-01-16,Gas for car,Transportation,45.00',
      '2024-01-17,Groceries,Shopping,120.75'
    ].join('\n')

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'expenses-template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setImportFile(file)
    } else {
      setMessage({ type: 'error', text: 'Please select a valid CSV file' })
    }
  }

  const handleImportCSV = async () => {
    if (!importFile) return

    try {
      setIsImporting(true)
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row')
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const expectedHeaders = ['Date', 'Description', 'Category', 'Amount']
      
      if (!expectedHeaders.every(header => headers.includes(header))) {
        throw new Error('CSV file must have columns: Date, Description, Category, Amount')
      }

      const expenses: CreateExpenseRequest[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        
        if (values.length !== headers.length) continue

        const dateIndex = headers.indexOf('Date')
        const descriptionIndex = headers.indexOf('Description')
        const categoryIndex = headers.indexOf('Category')
        const amountIndex = headers.indexOf('Amount')

        const date = new Date(values[dateIndex])
        const amount = parseFloat(values[amountIndex])

        if (isNaN(date.getTime()) || isNaN(amount)) {
          console.warn(`Skipping invalid row ${i + 1}`)
          continue
        }

        expenses.push({
          amount,
          description: values[descriptionIndex],
          category: values[categoryIndex],
          date: date.toISOString().split('T')[0]
        })
      }

      // Import expenses one by one
      let importedCount = 0
      for (const expense of expenses) {
        try {
          await expenseService.createExpense(expense)
          importedCount++
        } catch (error) {
          console.warn('Failed to import expense:', expense, error)
        }
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${importedCount} out of ${expenses.length} expenses` 
      })
      setImportFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('csv-import') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to import CSV file' 
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application preferences</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Currency</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Currency
              </label>
              <select
                value={currency.code}
                onChange={async (e) => {
                  const selectedCurrency = CURRENCIES.find(c => c.code === e.target.value)
                  if (selectedCurrency) {
                    try {
                      await setCurrency(selectedCurrency)
                      setMessage({ type: 'success', text: 'Currency updated successfully!' })
                    } catch (error) {
                      setMessage({ type: 'error', text: 'Failed to update currency' })
                    }
                  }
                }}
                disabled={isLoading}
                className="input-field"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <p className="text-lg font-semibold">
                {formatAmount(1234.56)} - {currency.name}
              </p>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleEmailUpdate}
                  disabled={isUpdatingEmail}
                  className="btn-primary whitespace-nowrap"
                >
                  {isUpdatingEmail ? 'Updating...' : 'Update'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bind your email to receive expense reminders and notifications
              </p>
            </div>
            
            {user?.email && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Email notifications are enabled
                </p>
                <p className="text-xs text-green-600 mt-1">
                  You'll receive scheduled expense reminders
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            {/* Export */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Export Expenses</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download all your expenses as a CSV file
              </p>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>

            {/* Import */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Expenses</h3>
              <p className="text-sm text-gray-600 mb-3">
                Import expenses from a CSV file. Download the template first to see the required format.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </button>
                
                <div>
                  <input
                    id="csv-import"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                
                {importFile && (
                  <button
                    onClick={handleImportCSV}
                    disabled={isImporting}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
