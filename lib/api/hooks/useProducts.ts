import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { Product } from '@/lib/utils-pos'
import { getErrorMessage } from '@/lib/api/errors'
import { toast } from 'sonner'

const PRODUCTS_KEY = ['products']

export const useProducts = () => {
    return useQuery({
        queryKey: PRODUCTS_KEY,
        queryFn: async () => {
            const response = await apiClient.get<Product[]>('/products')
            return response.data
        },
    })
}

export const useActiveProducts = () => {
    return useQuery({
        queryKey: [...PRODUCTS_KEY, 'active'],
        queryFn: async () => {
            const response = await apiClient.get<Product[]>('/products?active=true')
            return response.data
        },
    })
}

export const useCreateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (product: Partial<Product>) => {
            const response = await apiClient.post<Product>('/products', product)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
            toast.success('Product created')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
            const response = await apiClient.put<Product>(`/products/${id}`, product)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
            toast.success('Product updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/products/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
            toast.success('Product deleted')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useToggleProductActive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
            await apiClient.patch(`/products/${id}/toggle-active`, { active })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
            toast.success('Product status updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}
