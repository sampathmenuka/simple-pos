import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { Customer } from '@/lib/utils-pos'
import { getErrorMessage } from '@/lib/api/errors'
import { toast } from 'sonner'

const CUSTOMERS_KEY = ['customers']

export const useCustomers = () => {
    return useQuery({
        queryKey: CUSTOMERS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<Customer[]>('/customers')
            return response.data
        },
    })
}

export const useActiveCustomers = () => {
    return useQuery({
        queryKey: [...CUSTOMERS_KEY, 'active'],
        queryFn: async () => {
            const response = await apiClient.get<Customer[]>('/customers?active=true')
            return response.data
        },
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (customer: Partial<Customer>) => {
            const response = await apiClient.post<Customer>('/customers', customer)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
            toast.success('Customer created')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...customer }: Partial<Customer> & { id: number }) => {
            const response = await apiClient.put<Customer>(`/customers/${id}`, customer)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
            toast.success('Customer updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/customers/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
            toast.success('Customer deleted')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useToggleCustomerActive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
            await apiClient.patch(`/customers/${id}/toggle-active`, { active })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
            toast.success('Customer status updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}
