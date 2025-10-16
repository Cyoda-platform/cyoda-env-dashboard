/**
 * Test Setup
 * Configure testing environment
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
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

