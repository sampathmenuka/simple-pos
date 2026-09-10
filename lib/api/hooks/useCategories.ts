import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { Category } from '@/lib/utils-pos'
import { getErrorMessage } from '@/lib/api/errors'
import { toast } from 'sonner'

const CATEGORIES_KEY = ['categories']

export const useCategories = () => {
    return useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: async () => {
            const response = await apiClient.get<Category[]>('/categories')
            return response.data
        },
    })
}

export const useCreateCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (name: string) => {
            const response = await apiClient.post<Category>('/categories', { name })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
            toast.success('Category created')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useUpdateCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const response = await apiClient.put<Category>(`/categories/${id}`, { name })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
            toast.success('Category updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useDeleteCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/categories/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
            toast.success('Category deleted')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}

export const useToggleCategoryActive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
            await apiClient.patch(`/categories/${id}/toggle-active`, { active })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
            toast.success('Category status updated')
        },
        onError: (error) => toast.error(getErrorMessage(error))
    })
}
