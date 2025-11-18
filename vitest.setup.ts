import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia - MUST be done before any Ant Design components are imported
global.matchMedia = global.matchMedia || function (query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock localStorage with proper Storage interface
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString()
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }

  // Make the store enumerable so Object.keys() works
  [key: string]: any
}

const localStorageMock = new LocalStorageMock()

// Make localStorage enumerable
Object.defineProperty(window, 'localStorage', {
  value: new Proxy(localStorageMock, {
    ownKeys(target) {
      return Object.keys((target as any).store)
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === 'string' && (target as any).store.hasOwnProperty(prop)) {
        return {
          enumerable: true,
          configurable: true,
        }
      }
      return Object.getOwnPropertyDescriptor(target, prop)
    }
  })
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock @cyoda/ui-lib-react - must be done at setup level to be available globally
vi.mock('@cyoda/ui-lib-react', async () => {
  // Import the actual module to get real implementations
  const actual = await vi.importActual<typeof import('./packages/ui-lib-react/src/index')>('./packages/ui-lib-react/src/index')

  return {
    ...actual,
    // Ensure HelperStorage is available
    HelperStorage: actual.HelperStorage || class HelperStorage {
      private prefix = 'cyoda_'

      get<T = any>(key: string, defaultValue?: T): T | null {
        try {
          const item = localStorage.getItem(`${this.prefix}${key}`)
          if (item === null) {
            return defaultValue !== undefined ? defaultValue : null
          }
          return JSON.parse(item) as T
        } catch (error) {
          return defaultValue !== undefined ? defaultValue : null
        }
      }

      set(key: string, value: any): void {
        try {
          localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value))
        } catch (error) {
          console.error(`Error writing to localStorage: ${key}`, error)
        }
      }

      remove(key: string): void {
        try {
          localStorage.removeItem(`${this.prefix}${key}`)
        } catch (error) {
          console.error(`Error removing from localStorage: ${key}`, error)
        }
      }

      clear(): void {
        try {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
              localStorage.removeItem(key)
            }
          })
        } catch (error) {
          console.error('Error clearing localStorage', error)
        }
      }

      has(key: string): boolean {
        return localStorage.getItem(`${this.prefix}${key}`) !== null
      }
    },
    // Ensure HelperDictionary is available
    HelperDictionary: actual.HelperDictionary || {
      getLabel: (type: string, key: string) => key,
      getOptions: () => [],
    },
    // Ensure HelperFormat is available
    HelperFormat: actual.HelperFormat || {
      toLowerCase: (str: string) => str?.toLowerCase() || '',
      date: (date: string) => date ? new Date(date).toLocaleDateString() : '',
    },
  }
})

