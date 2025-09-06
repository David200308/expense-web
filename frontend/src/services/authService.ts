import axios from 'axios'
import { User, LoginRequest, ApiResponse } from '@/types'

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

export const authService = {
  async getNonce(walletAddress: string): Promise<{ nonce: string }> {
    const response = await api.get(`/auth/nonce/${walletAddress}`)
    return response.data
  },

  async login(loginData: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', loginData)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed')
    }
    
    return response.data.data
  },

  async verifyToken(token: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Token verification failed')
    }
    
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async updateProfile(data: { currency?: string; email?: string }): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/users/profile', data)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update profile')
    }
    
    return response.data.data
  }
}
