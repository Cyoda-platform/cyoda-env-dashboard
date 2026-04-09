/**
 * Mock for monaco-editor
 * Used in tests to avoid dependency issues
 */

export const editor = {
  create: () => ({}),
  createDiffEditor: () => ({}),
};

export const languages = {
  register: () => {},
  setMonarchTokensProvider: () => {},
};

export default {
  editor,
  languages,
};

