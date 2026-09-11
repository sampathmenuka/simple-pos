import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { Order } from '@/lib/utils-pos'
import { getErrorMessage } from '@/lib/api/errors'
import { toast } from 'sonner'

const ORDERS_KEY = ['orders']

export const useOrders = () => {
    return useQuery({
        queryKey: ORDERS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<Order[]>('/orders')
            return response.data
        },
    })
}

export const useCreateOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { items: any[], customerId?: number | null, discount: number }) => {
            const response = await apiClient.post<Order>('/orders', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}
