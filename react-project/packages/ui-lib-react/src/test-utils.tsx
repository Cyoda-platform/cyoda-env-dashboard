import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConfigProvider } from 'antd'

/**
 * Custom render function that wraps components with necessary providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }

