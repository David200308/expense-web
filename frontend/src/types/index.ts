export interface User {
  id: string
  walletAddress: string
  currency: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  userId: string
  amount: number
  description: string
  category: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  walletAddress: string
  signature: string
  message: string
}

export interface CreateExpenseRequest {
  amount: number
  description: string
  category: string
  date: string
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
