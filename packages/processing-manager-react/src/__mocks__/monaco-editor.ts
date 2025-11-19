/**
 * Mock for monaco-editor
 */

export const editor = {
  create: () => ({
    dispose: () => {},
    getValue: () => '',
    setValue: () => {},
    onDidChangeModelContent: () => ({ dispose: () => {} }),
    updateOptions: () => {},
    layout: () => {},
  }),
  defineTheme: () => {},
  setTheme: () => {},
};

export const languages = {
  register: () => {},
  setMonarchTokensProvider: () => {},
  setLanguageConfiguration: () => {},
};

export const Range = class {
  constructor() {}
};

export const Selection = class {
  constructor() {}
};

export default {
  editor,
  languages,
  Range,
  Selection,
};

