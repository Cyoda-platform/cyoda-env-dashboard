/**
 * Test Utilities - Re-exports from @cyoda/ui-lib-react
 */

export {
  createTestQueryClient,
  createWrapper,
  renderWithProviders,
  waitForAsync,
} from '@cyoda/ui-lib-react';

// Alias for backward compatibility
export { renderWithProviders as renderWithClient } from '@cyoda/ui-lib-react';

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

