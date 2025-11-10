/**
 * Cyoda Neon Dark Theme for Monaco Editor
 * Vibrant neon colors matching the state machine diagram theme
 *
 * Color Palette:
 * - Neon Teal (#14b8a6): States, primary accents
 * - Neon Purple (#a78bfa): Transitions, functions
 * - Neon Pink (#ec4899): Criteria, special highlights
 * - Neon Amber (#f59e0b): Current state, warnings
 * - Dark Background (#0f172a): Canvas background
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

    // JSON specific tokens - HIGHEST PRIORITY
    { token: 'string.key.json', foreground: 'EC4899' }, // Neon Pink for JSON keys
    { token: 'string.value.json', foreground: '14B8A6' }, // Neon Teal for JSON values
    { token: 'number.json', foreground: 'F59E0B' }, // Neon Amber for numbers
    { token: 'keyword.json', foreground: 'F59E0B' }, // Neon Amber for true/false/null
    { token: 'delimiter.bracket.json', foreground: 'A78BFA' }, // Neon Purple for {}
    { token: 'delimiter.array.json', foreground: 'F59E0B' }, // Neon Amber for []
    { token: 'delimiter.colon.json', foreground: 'A8B5C8' }, // Gray for :
    { token: 'delimiter.comma.json', foreground: 'A8B5C8' }, // Gray for ,

    // Generic strings - Neon Teal (fallback)
    { token: 'string', foreground: '14B8A6' },
    { token: 'string.quoted', foreground: '14B8A6' },
    { token: 'string.double', foreground: '14B8A6' },
    { token: 'string.single', foreground: '14B8A6' },

    // Keywords - Neon Amber
    { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'F59E0B', fontStyle: 'bold' },
    { token: 'keyword.operator', foreground: 'A78BFA' },

    // Numbers - Neon Amber
    { token: 'number', foreground: 'F59E0B' },
    { token: 'number.float', foreground: 'F59E0B' },
    { token: 'number.hex', foreground: 'F59E0B' },
    { token: 'number.octal', foreground: 'F59E0B' },
    { token: 'number.binary', foreground: 'F59E0B' },

    // Booleans and null - Neon Amber
    { token: 'constant.language.boolean', foreground: 'F59E0B' },
    { token: 'constant.language.null', foreground: 'F59E0B' },
    { token: 'constant.language.undefined', foreground: 'F59E0B' },

    // Functions - Neon Purple
    { token: 'function', foreground: 'A78BFA' },
    { token: 'entity.name.function', foreground: 'A78BFA' },
    { token: 'support.function', foreground: 'A78BFA' },

    // Variables
    { token: 'variable', foreground: 'E0E0E0' },
    { token: 'variable.parameter', foreground: 'EC4899' }, // Neon Pink
    { token: 'variable.other', foreground: 'E0E0E0' },

    // Types - Neon Teal
    { token: 'type', foreground: '14B8A6' },
    { token: 'type.identifier', foreground: '14B8A6' },
    { token: 'entity.name.type', foreground: '14B8A6' },

    // Operators - Neon Purple
    { token: 'operator', foreground: 'A78BFA' },

    // Delimiters - Gray (default)
    { token: 'delimiter', foreground: 'A8B5C8' },
    { token: 'delimiter.bracket', foreground: 'A8B5C8' },
    { token: 'delimiter.parenthesis', foreground: 'A8B5C8' },
    { token: 'delimiter.square', foreground: 'A8B5C8' },

    // Constants - Neon Amber
    { token: 'constant', foreground: 'F59E0B' },
    { token: 'constant.language', foreground: 'F59E0B' },
    { token: 'constant.numeric', foreground: 'F59E0B' },
    { token: 'constant.character', foreground: 'F59E0B' },

    // Tags (HTML/XML) - Neon Pink
    { token: 'tag', foreground: 'EC4899' },
    { token: 'tag.id', foreground: 'A78BFA' },
    { token: 'tag.class', foreground: '14B8A6' },

    // Attributes - Neon Pink
    { token: 'attribute.name', foreground: 'EC4899' },
    { token: 'attribute.value', foreground: '14B8A6' },

    // Regex - Neon Amber
    { token: 'regexp', foreground: 'F59E0B' },

    // Invalid - Red
    { token: 'invalid', foreground: 'EF4444', fontStyle: 'bold' },
  ],
  colors: {
    // Editor background - Dark slate (matching state machine)
    'editor.background': '#0f172a',
    'editor.foreground': '#E0E0E0',

    // Line numbers - Neon Teal accent
    'editorLineNumber.foreground': '#6B7280',
    'editorLineNumber.activeForeground': '#14b8a6',

    // Current line
    'editor.lineHighlightBackground': '#1e293b',
    'editor.lineHighlightBorder': '#00000000',

    // Selection - Neon Teal
    'editor.selectionBackground': '#14b8a633',
    'editor.inactiveSelectionBackground': '#14b8a622',
    'editor.selectionHighlightBackground': '#14b8a622',

    // Cursor - Neon Teal
    'editorCursor.foreground': '#14b8a6',

    // Whitespace
    'editorWhitespace.foreground': '#374151',

    // Indent guides
    'editorIndentGuide.background': '#374151',
    'editorIndentGuide.activeBackground': '#4B5563',

    // Gutter
    'editorGutter.background': '#0f172a',
    'editorGutter.modifiedBackground': '#A78BFA', // Neon Purple
    'editorGutter.addedBackground': '#14b8a6', // Neon Teal
    'editorGutter.deletedBackground': '#EF4444',

    // Scrollbar - Neon Teal accent
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#374151',
    'scrollbarSlider.hoverBackground': '#4B5563',
    'scrollbarSlider.activeBackground': '#14b8a6',

    // Minimap
    'minimap.background': '#0a0f1a',
    'minimap.selectionHighlight': '#14b8a633',

    // Brackets - Neon Teal
    'editorBracketMatch.background': '#14b8a622',
    'editorBracketMatch.border': '#14b8a6',

    // Find/Replace - Neon Amber
    'editor.findMatchBackground': '#F59E0B44',
    'editor.findMatchHighlightBackground': '#F59E0B22',
    'editor.findRangeHighlightBackground': '#F59E0B11',

    // Widgets
    'editorWidget.background': '#0f172a',
    'editorWidget.border': '#374151',
    'editorSuggestWidget.background': '#0f172a',
    'editorSuggestWidget.border': '#374151',
    'editorSuggestWidget.selectedBackground': '#1e293b',
    'editorHoverWidget.background': '#0f172a',
    'editorHoverWidget.border': '#374151',

    // Peek view - Neon Teal accent
    'peekView.border': '#14b8a6',
    'peekViewEditor.background': '#0a0f1a',
    'peekViewResult.background': '#0f172a',
    'peekViewTitle.background': '#1e293b',

    // Diff editor - Neon colors
    'diffEditor.insertedTextBackground': '#14b8a622',
    'diffEditor.removedTextBackground': '#EF444422',

    // Overview ruler
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.modifiedForeground': '#A78BFA', // Neon Purple
    'editorOverviewRuler.addedForeground': '#14b8a6', // Neon Teal
    'editorOverviewRuler.deletedForeground': '#EF4444',
    'editorOverviewRuler.errorForeground': '#EF4444',
    'editorOverviewRuler.warningForeground': '#F59E0B', // Neon Amber

    // Error/Warning squiggles
    'editorError.foreground': '#EF4444',
    'editorWarning.foreground': '#F59E0B', // Neon Amber
    'editorInfo.foreground': '#A78BFA', // Neon Purple
    'editorHint.foreground': '#14b8a6', // Neon Teal
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

