import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { getErrorMessage } from '@/lib/api/errors'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const AUTH_KEY = ['auth']

export const useLogin = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (credentials: any) => {
            const response = await apiClient.post('/auth/login', credentials)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_KEY, data.user)
            toast.success('Login successful')
            router.push('/')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}

export const useLogout = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => { await apiClient.post('/auth/logout') },
        onSuccess: () => {
            queryClient.clear() 
            toast.success('Logged out')
            router.push('/login')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}

export const useInitAuth = () => {
    return useQuery({
        queryKey: [...AUTH_KEY, 'init'],
        queryFn: async () => {
            const response = await apiClient.get('/auth/init')
            return response.data
        },
        retry: false,
        refetchOnWindowFocus: false,
    })
}