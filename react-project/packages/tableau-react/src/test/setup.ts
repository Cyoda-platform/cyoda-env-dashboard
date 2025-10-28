/**
 * Test Setup
 * Configure testing environment
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.tableau for Tableau Web Data Connector
global.window.tableau = {
  connectionData: '',
  connectionName: '',
  submit: () => {},
  abortWithError: () => {},
  log: () => {},
  reportProgress: () => {},
  phase: 'interactive',
  authPurpose: 'ephemeral',
  username: '',
  password: '',
  platformOS: 'mac',
  platformVersion: '10.15',
  platformEdition: 'desktop',
  platformBuildNumber: '20201.20.0101.0000',
  locale: 'en-US',
  language: 'en',
  version: '2020.1',
};

// Mock @monaco-editor/react
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(() => null),
}));

// Mock monaco-editor to avoid import errors
vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn(),
    createDiffEditor: vi.fn(),
  },
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
  },
}));

// Mock axios - this must be at the top level to be hoisted
vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      paramsSerializer: { serialize: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockInstance),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
      patch: vi.fn(() => Promise.resolve({ data: {} })),
      defaults: {
        paramsSerializer: { serialize: vi.fn() },
      },
    },
  };
});

