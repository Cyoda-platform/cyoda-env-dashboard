/**
 * Monaco Editor Mock for Vitest
 * This file provides a mock implementation of monaco-editor for testing
 */

export const editor = {
  create: () => ({
    dispose: () => {},
    getValue: () => '',
    setValue: () => {},
    onDidChangeModelContent: () => ({ dispose: () => {} }),
    getModel: () => null,
    setModel: () => {},
    layout: () => {},
    focus: () => {},
    addAction: () => ({ dispose: () => {} }),
  }),
  createDiffEditor: () => ({
    dispose: () => {},
    getModel: () => null,
    setModel: () => {},
    layout: () => {},
  }),
  defineTheme: () => {},
  setTheme: () => {},
};

export const languages = {
  register: () => {},
  setMonarchTokensProvider: () => {},
  registerCompletionItemProvider: () => ({ dispose: () => {} }),
  setLanguageConfiguration: () => ({ dispose: () => {} }),
};

export const Uri = {
  parse: (uri: string) => ({ toString: () => uri }),
  file: (path: string) => ({ toString: () => path }),
};

export const Range = class {
  constructor(
    public startLineNumber: number,
    public startColumn: number,
    public endLineNumber: number,
    public endColumn: number
  ) {}
};

export const Selection = class extends Range {};

export const KeyMod = {
  CtrlCmd: 2048,
  Shift: 1024,
  Alt: 512,
  WinCtrl: 256,
};

export const KeyCode = {
  Enter: 3,
  Escape: 9,
  Space: 10,
  Tab: 2,
};

export default {
  editor,
  languages,
  Uri,
  Range,
  Selection,
  KeyMod,
  KeyCode,
};

