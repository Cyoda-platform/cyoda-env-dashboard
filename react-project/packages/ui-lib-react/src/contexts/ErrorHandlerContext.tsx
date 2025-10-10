import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ErrorData {
  message: string
  info?: string
  stack?: string
  createdAt: string
  pageUrl?: string
  uiVersion?: string
}

interface ErrorHandlerContextType {
  errors: ErrorData[]
  addError: (error: ErrorData) => void
  clearErrors: () => void
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined)

const STORAGE_KEY = 'error-handler'

/**
 * ErrorHandlerProvider Component
 * Provides error handling state management across the application
 * Replaces Pinia store from Vue version
 */
export const ErrorHandlerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorData[]>(() => {
    // Load errors from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        return data.errors || []
      }
    } catch (e) {
      console.error('Failed to load errors from storage:', e)
    }
    return []
  })

  // Persist errors to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ errors }))
    } catch (e) {
      console.error('Failed to save errors to storage:', e)
    }
  }, [errors])

  const addError = (error: ErrorData) => {
    setErrors(prev => [...prev, error])
  }

  const clearErrors = () => {
    setErrors([])
  }

  return (
    <ErrorHandlerContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorHandlerContext.Provider>
  )
}

/**
 * Custom hook to use error handler context
 * @returns Error handler context
 */
export const useErrorHandler = (): ErrorHandlerContextType => {
  const context = useContext(ErrorHandlerContext)
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorHandlerProvider')
  }
  return context
}

