/**
 * Cyoda Neon Dark Theme for Monaco Editor
 * Vibrant neon colors matching the CYODA brand theme
 *
 * Color Palette:
 * - CYODA Teal (#00D4AA): States, primary accents, brand color
 * - Neon Purple (#a78bfa): Transitions, functions
 * - Neon Pink (#ec4899): Criteria, special highlights
 * - Neon Amber (#f59e0b): Current state, warnings
 * - Dark Background (#1a2332): Canvas background (matching saas-app)
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
    { token: 'string.value.json', foreground: '00D4AA' }, // CYODA Teal for JSON values
    { token: 'number.json', foreground: 'F59E0B' }, // Neon Amber for numbers
    { token: 'keyword.json', foreground: 'F59E0B' }, // Neon Amber for true/false/null
    { token: 'delimiter.bracket.json', foreground: 'A78BFA' }, // Neon Purple for {}
    { token: 'delimiter.array.json', foreground: 'F59E0B' }, // Neon Amber for []
    { token: 'delimiter.colon.json', foreground: 'A8B5C8' }, // Gray for :
    { token: 'delimiter.comma.json', foreground: 'A8B5C8' }, // Gray for ,

    // Generic strings - CYODA Teal (fallback)
    { token: 'string', foreground: '00D4AA' },
    { token: 'string.quoted', foreground: '00D4AA' },
    { token: 'string.double', foreground: '00D4AA' },
    { token: 'string.single', foreground: '00D4AA' },

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
    // Editor background - Dark navy (matching header gradient)
    'editor.background': '#1a2332',
    'editor.foreground': '#F9FAFB', // Light text for readability

    // Line numbers - CYODA Teal accent
    'editorLineNumber.foreground': '#6B7280',
    'editorLineNumber.activeForeground': '#00D4AA',

    // Current line
    'editor.lineHighlightBackground': '#1e293b',
    'editor.lineHighlightBorder': '#00000000',

    // Selection - CYODA Teal
    'editor.selectionBackground': '#00D4AA33',
    'editor.inactiveSelectionBackground': '#00D4AA22',
    'editor.selectionHighlightBackground': '#00D4AA22',

    // Cursor - CYODA Teal
    'editorCursor.foreground': '#00D4AA',

    // Whitespace
    'editorWhitespace.foreground': '#374151',

    // Indent guides
    'editorIndentGuide.background': '#374151',
    'editorIndentGuide.activeBackground': '#4B5563',

    // Gutter
    'editorGutter.background': '#1a2332',
    'editorGutter.modifiedBackground': '#A78BFA', // Neon Purple
    'editorGutter.addedBackground': '#00D4AA', // CYODA Teal
    'editorGutter.deletedBackground': '#EF4444',

    // Scrollbar - CYODA Teal accent
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#374151',
    'scrollbarSlider.hoverBackground': '#4B5563',
    'scrollbarSlider.activeBackground': '#00D4AA',

    // Minimap
    'minimap.background': '#0a0f1a',
    'minimap.selectionHighlight': '#00D4AA33',

    // Brackets - CYODA Teal
    'editorBracketMatch.background': '#00D4AA22',
    'editorBracketMatch.border': '#00D4AA',

    // Find/Replace - Neon Amber
    'editor.findMatchBackground': '#F59E0B44',
    'editor.findMatchHighlightBackground': '#F59E0B22',
    'editor.findRangeHighlightBackground': '#F59E0B11',

    // Widgets
    'editorWidget.background': '#1a2332',
    'editorWidget.border': '#374151',
    'editorSuggestWidget.background': '#1a2332',
    'editorSuggestWidget.border': '#374151',
    'editorSuggestWidget.selectedBackground': '#1e293b',
    'editorHoverWidget.background': '#1a2332',
    'editorHoverWidget.border': '#374151',

    // Peek view - CYODA Teal accent
    'peekView.border': '#00D4AA',
    'peekViewEditor.background': '#1a2332',
    'peekViewResult.background': '#1a2332',
    'peekViewTitle.background': '#1e293b',

    // Diff editor - CYODA colors with better visibility (brighter for readability)
    'diffEditor.insertedTextBackground': '#00D4AA40', // Brighter teal background for added text
    'diffEditor.removedTextBackground': '#EF444440', // Brighter red background for removed text
    'diffEditor.insertedLineBackground': '#00D4AA25', // Lighter teal for full line
    'diffEditor.removedLineBackground': '#EF444425', // Lighter red for full line
    'diffEditor.insertedTextBorder': '#00D4AA80', // Visible teal border for added text
    'diffEditor.removedTextBorder': '#EF444480', // Visible red border for removed text
    'diffEditor.border': '#374151', // Border between editors
    'diffEditor.diagonalFill': '#1e293b80', // Diagonal fill for unchanged regions

    // Overview ruler
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.modifiedForeground': '#A78BFA', // Neon Purple
    'editorOverviewRuler.addedForeground': '#00D4AA', // CYODA Teal
    'editorOverviewRuler.deletedForeground': '#EF4444',
    'editorOverviewRuler.errorForeground': '#EF4444',
    'editorOverviewRuler.warningForeground': '#F59E0B', // Neon Amber

    // Error/Warning squiggles
    'editorError.foreground': '#EF4444',
    'editorWarning.foreground': '#F59E0B', // Neon Amber
    'editorInfo.foreground': '#A78BFA', // Neon Purple
    'editorHint.foreground': '#00D4AA', // CYODA Teal
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
  monaco.editor.setTheme('cyoda-dark');
}

