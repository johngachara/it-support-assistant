import toast from 'react-hot-toast';

/**
 * Centralized toast notification utility
 * Provides consistent styling and behavior across the app
 */

const toastConfig = {
    success: {
        duration: 4000,
        style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
        },
    },
    error: {
        duration: 6000,
        style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
        },
    },
    loading: {
        style: {
            background: '#3B82F6',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
    },
    promise: {
        loading: 'Processing...',
        success: 'Success!',
        error: 'Something went wrong',
    },
};

export const showToast = {
    success: (message) => {
        toast.success(message, toastConfig.success);
    },

    error: (message) => {
        toast.error(message, toastConfig.error);
    },

    loading: (message) => {
        return toast.loading(message, toastConfig.loading);
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },

    promise: (promise, messages = {}) => {
        return toast.promise(promise, {
            loading: messages.loading || toastConfig.promise.loading,
            success: messages.success || toastConfig.promise.success,
            error: messages.error || toastConfig.promise.error,
        });
    },

    // Custom toast for specific scenarios
    custom: (message, options = {}) => {
        toast(message, {
            ...options,
            style: {
                padding: '16px',
                borderRadius: '8px',
                ...options.style,
            },
        });
    },
};

// Helper to format error messages
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'An unexpected error occurred';
};

// Specific error handlers for common scenarios
export const handleAuthError = (error) => {
    const message = formatErrorMessage(error);

    // Map common auth errors to user-friendly messages
    const authErrorMap = {
        'Invalid login credentials': 'Incorrect email or password. Please try again.',
        'Email not confirmed': 'Please verify your email address before signing in.',
        'User already registered': 'An account with this email already exists.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    };

    const friendlyMessage = authErrorMap[message] || message;
    showToast.error(friendlyMessage);
};

export const handleDatabaseError = (error, operation = 'operation') => {
    const message = formatErrorMessage(error);
    showToast.error(`Failed to ${operation}: ${message}`);
};

export const handleNetworkError = (error) => {
    showToast.error('Network error. Please check your internet connection.');
};

export const handleAIError = (error) => {
    const message = formatErrorMessage(error);
    showToast.error(`AI service error: ${message}`);
};

export default showToast;
