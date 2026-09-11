import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError) => {
        // Handle global errors
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
            toast.error('Session expired. Please login again.')
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.')
        } else if (error.response?.status === 404) {
            // Don't show toast for 404 - component will handle it
        } else if (error.response?.status === 500) {
            toast.error('Server error. Please try again later.')
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Please check your connection.')
        }

        return Promise.reject(error)
    }
)

export default apiClient
