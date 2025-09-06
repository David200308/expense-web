import axios from 'axios'
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3020/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    const response = await api.get<ApiResponse<Expense[]>>('/expenses')
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch expenses')
    }
    
    return response.data.data
  },

  async getExpense(id: string): Promise<Expense> {
    const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch expense')
    }
    
    return response.data.data
  },

  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    const response = await api.post<ApiResponse<Expense>>('/expenses', expenseData)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create expense')
    }
    
    return response.data.data
  },

  async updateExpense(expenseData: UpdateExpenseRequest): Promise<Expense> {
    const { id, ...data } = expenseData
    const response = await api.patch<ApiResponse<Expense>>(`/expenses/${id}`, data)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update expense')
    }
    
    return response.data.data
  },

  async deleteExpense(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/expenses/${id}`)
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete expense')
    }
  }
}
