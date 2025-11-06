/**
 * Utility functions for formatting data
 */

export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  // Placeholder - will be implemented with moment or date-fns
  return new Date(date).toISOString().split('T')[0]
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

