/**
 * Cyoda Dark Theme for Monaco Editor
 * Vibrant colors inspired by modern code editors
 */

import type { editor } from 'monaco-editor';

export const CYODA_DARK_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Comments
    { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '6B7280', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '6B7280', fontStyle: 'italic' },
    
    // Keywords
    { token: 'keyword', foreground: 'FB923C', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'FB923C', fontStyle: 'bold' },
    { token: 'keyword.operator', foreground: '60A5FA' },
    
    // Strings
    { token: 'string', foreground: '34D399' },
    { token: 'string.key.json', foreground: 'F472B6' },
    { token: 'string.value.json', foreground: '34D399' },
    
    // Numbers
    { token: 'number', foreground: 'FBBF24' },
    { token: 'number.json', foreground: 'FBBF24' },
    
    // Booleans
    { token: 'keyword.json', foreground: 'FBBF24' },
    
    // Functions
    { token: 'function', foreground: 'A78BFA' },
    { token: 'entity.name.function', foreground: 'A78BFA' },
    
    // Variables
    { token: 'variable', foreground: 'E0E0E0' },
    { token: 'variable.parameter', foreground: 'FCA5A5' },
    
    // Types
    { token: 'type', foreground: '60A5FA' },
    { token: 'type.identifier', foreground: '60A5FA' },
    
    // Operators
    { token: 'operator', foreground: '60A5FA' },
    { token: 'delimiter', foreground: 'A8B5C8' },
    { token: 'delimiter.bracket', foreground: 'A8B5C8' },
    { token: 'delimiter.array.json', foreground: 'FBBF24' },
    { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
    
    // Constants
    { token: 'constant', foreground: 'FBBF24' },
    { token: 'constant.language', foreground: 'FBBF24' },
    { token: 'constant.numeric', foreground: 'FBBF24' },
    
    // Tags (HTML/XML)
    { token: 'tag', foreground: 'F472B6' },
    { token: 'tag.id', foreground: 'A78BFA' },
    { token: 'tag.class', foreground: '60A5FA' },
    
    // Attributes
    { token: 'attribute.name', foreground: 'F472B6' },
    { token: 'attribute.value', foreground: '34D399' },
    
    // Regex
    { token: 'regexp', foreground: 'F59E0B' },
    
    // Invalid
    { token: 'invalid', foreground: 'EF4444', fontStyle: 'bold' },
  ],
  colors: {
    // Editor background
    'editor.background': '#1E2A3A',
    'editor.foreground': '#E0E0E0',
    
    // Line numbers
    'editorLineNumber.foreground': '#6B7280',
    'editorLineNumber.activeForeground': '#00D4AA',
    
    // Current line
    'editor.lineHighlightBackground': '#243142',
    'editor.lineHighlightBorder': '#00000000',
    
    // Selection
    'editor.selectionBackground': '#00D4AA33',
    'editor.inactiveSelectionBackground': '#00D4AA22',
    'editor.selectionHighlightBackground': '#00D4AA22',
    
    // Cursor
    'editorCursor.foreground': '#00D4AA',
    
    // Whitespace
    'editorWhitespace.foreground': '#374151',
    
    // Indent guides
    'editorIndentGuide.background': '#374151',
    'editorIndentGuide.activeBackground': '#4B5563',
    
    // Gutter
    'editorGutter.background': '#1E2A3A',
    'editorGutter.modifiedBackground': '#60A5FA',
    'editorGutter.addedBackground': '#34D399',
    'editorGutter.deletedBackground': '#EF4444',
    
    // Scrollbar
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#374151',
    'scrollbarSlider.hoverBackground': '#4B5563',
    'scrollbarSlider.activeBackground': '#00D4AA',
    
    // Minimap
    'minimap.background': '#1A2332',
    'minimap.selectionHighlight': '#00D4AA33',
    
    // Brackets
    'editorBracketMatch.background': '#00D4AA22',
    'editorBracketMatch.border': '#00D4AA',
    
    // Find/Replace
    'editor.findMatchBackground': '#F59E0B44',
    'editor.findMatchHighlightBackground': '#F59E0B22',
    'editor.findRangeHighlightBackground': '#F59E0B11',
    
    // Widgets
    'editorWidget.background': '#1E2A3A',
    'editorWidget.border': '#374151',
    'editorSuggestWidget.background': '#1E2A3A',
    'editorSuggestWidget.border': '#374151',
    'editorSuggestWidget.selectedBackground': '#243142',
    'editorHoverWidget.background': '#1E2A3A',
    'editorHoverWidget.border': '#374151',
    
    // Peek view
    'peekView.border': '#00D4AA',
    'peekViewEditor.background': '#1A2332',
    'peekViewResult.background': '#1E2A3A',
    'peekViewTitle.background': '#243142',
    
    // Diff editor
    'diffEditor.insertedTextBackground': '#34D39922',
    'diffEditor.removedTextBackground': '#EF444422',
    
    // Overview ruler
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.modifiedForeground': '#60A5FA',
    'editorOverviewRuler.addedForeground': '#34D399',
    'editorOverviewRuler.deletedForeground': '#EF4444',
    'editorOverviewRuler.errorForeground': '#EF4444',
    'editorOverviewRuler.warningForeground': '#F59E0B',
    
    // Error/Warning squiggles
    'editorError.foreground': '#EF4444',
    'editorWarning.foreground': '#F59E0B',
    'editorInfo.foreground': '#60A5FA',
    'editorHint.foreground': '#00D4AA',
  },
};

/**
 * Default Monaco Editor options for Cyoda theme
 */
export const CYODA_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
  fontSize: 14,
  lineHeight: 22,
  fontLigatures: true, // Enable font ligatures for Fira Code
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  roundedSelection: false,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 10, bottom: 10 },
};

/**
 * Register the Cyoda Dark theme with Monaco
 */
export function registerCyodaDarkTheme(monaco: any) {
  monaco.editor.defineTheme('cyoda-dark', CYODA_DARK_THEME);
}

