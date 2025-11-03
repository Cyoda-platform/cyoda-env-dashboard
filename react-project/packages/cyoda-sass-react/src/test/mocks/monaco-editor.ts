import { vi } from 'vitest';

// Mock monaco-editor for tests
export const editor = {
  create: vi.fn(() => ({
    dispose: vi.fn(),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    onDidChangeModelContent: vi.fn(),
    updateOptions: vi.fn(),
    layout: vi.fn(),
    getModel: vi.fn(() => ({
      dispose: vi.fn(),
    })),
  })),
  defineTheme: vi.fn(),
  setTheme: vi.fn(),
  setModelLanguage: vi.fn(),
};

export const languages = {
  register: vi.fn(),
  setMonarchTokensProvider: vi.fn(),
  setLanguageConfiguration: vi.fn(),
  registerCompletionItemProvider: vi.fn(),
};

export const Range = vi.fn();
export const Selection = vi.fn();
export const KeyCode = {};
export const KeyMod = {};

export default {
  editor,
  languages,
  Range,
  Selection,
  KeyCode,
  KeyMod,
};

