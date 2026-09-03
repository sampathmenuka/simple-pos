import { AxiosError } from 'axios'

export interface ApiError {
    message: string
    status?: number
    code?: string
    details?: unknown
}

/**
 * Normalize axios error to ApiError interface
 */
export const normalizeError = (error: unknown): ApiError => {
    if (error instanceof AxiosError) {
        return {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status,
            code: error.code,
            details: error.response?.data,
        }
    }

    if (error instanceof Error) {
        return {
            message: error.message,
        }
    }

    return {
        message: 'An unknown error occurred',
        details: error,
    }
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
    const apiError = normalizeError(error)

    const statusMessages: { [key: number]: string } = {
        400: 'Bad request. Please check your input.',
        401: 'Unauthorized. Please login again.',
        403: 'You do not have permission to perform this action.',
        404: 'Resource not found.',
        409: 'This item already exists.',
        422: 'Invalid data provided.',
        500: 'Server error. Please try again later.',
        503: 'Service temporarily unavailable.',
    }

    if (apiError.status && statusMessages[apiError.status]) {
        return statusMessages[apiError.status]
    }

    return apiError.message || 'An error occurred. Please try again.'
}
