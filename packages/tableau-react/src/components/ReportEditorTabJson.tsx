/**
 * ReportEditorTabJson Component
 * Tab for viewing/editing raw JSON configuration
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabJson.vue
 */

import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor, { BeforeMount, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { ReportDefinition } from '../types';
import './ReportEditorTabJson.scss';

interface ReportEditorTabJsonProps {
  configDefinition: ReportDefinition;
  onChange: (config: ReportDefinition) => void;
}

const ReportEditorTabJson: React.FC<ReportEditorTabJsonProps> = ({
  configDefinition,
  onChange,
}) => {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Detect theme from document attribute
  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const newTheme = theme === 'light' ? 'light' : 'dark';
      setCurrentTheme(newTheme);

      // Update Monaco theme if editor is mounted
      if (monacoRef.current && editorRef.current) {
        const monacoTheme = newTheme === 'light' ? 'cyoda-light' : 'cyoda-neon-dark';
        monacoRef.current.editor.setTheme(monacoTheme);

        // Force editor to re-render
        setTimeout(() => {
          editorRef.current?.layout();
        }, 0);
      }
    };

    // Initial detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Update JSON string when config changes
  useEffect(() => {
    try {
      const formatted = JSON.stringify(configDefinition, null, 2);
      setJsonString(formatted);
      setIsValid(true);
    } catch (error) {
      console.error('Error formatting JSON:', error);
      setIsValid(false);
    }
  }, [configDefinition]);

  // Define custom themes before editor mounts
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;

    // Dark theme
    monaco.editor.defineTheme('cyoda-neon-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        // Keywords - Neon Amber
        { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'keyword.json', foreground: 'F59E0B' },
        // Strings - Neon Pink for keys, Neon Teal for values
        { token: 'string.key.json', foreground: 'EC4899' },
        { token: 'string.value.json', foreground: '14B8A6' },
        { token: 'string', foreground: '14B8A6' },
        // Numbers - Neon Amber
        { token: 'number', foreground: 'F59E0B' },
        // Delimiters - Neon Purple for {}, Neon Amber for []
        { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
        { token: 'delimiter.array.json', foreground: 'F59E0B' },
        { token: 'delimiter', foreground: 'A8B5C8' },
      ],
      colors: {
        // Match header gradient color - using top color from header
        'editor.background': '#1a2332',
        'editor.foreground': '#E0E0E0',
        'editorLineNumber.foreground': '#6B7280',
        'editorLineNumber.activeForeground': '#14b8a6',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#14b8a633',
        'editor.inactiveSelectionBackground': '#14b8a622',
        'editorCursor.foreground': '#14b8a6',
        'editorWhitespace.foreground': '#374151',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#4B5563',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4B5563',
        'scrollbarSlider.activeBackground': '#14b8a6',
      },
    });

    // Light theme - same colors as dark, just white background
    monaco.editor.defineTheme('cyoda-light', {
      base: 'vs',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        // Keywords - Neon Amber (same as dark)
        { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'keyword.json', foreground: 'F59E0B' },
        // Strings - Neon Pink for keys, Neon Teal for values (same as dark)
        { token: 'string.key.json', foreground: 'EC4899' },
        { token: 'string.value.json', foreground: '14B8A6' },
        { token: 'string', foreground: '14B8A6' },
        // Numbers - Neon Amber (same as dark)
        { token: 'number', foreground: 'F59E0B' },
        // Delimiters - Neon Purple for {}, Neon Amber for [] (same as dark)
        { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
        { token: 'delimiter.array.json', foreground: 'F59E0B' },
        { token: 'delimiter', foreground: 'A8B5C8' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#1F2937',
        'editorLineNumber.foreground': '#9CA3AF',
        'editorLineNumber.activeForeground': '#14b8a6',
        'editor.lineHighlightBackground': '#F9FAFB',
        'editor.selectionBackground': '#14b8a633',
        'editor.inactiveSelectionBackground': '#14b8a622',
        'editor.selectionHighlightBackground': '#14b8a622',
        'editor.wordHighlightBackground': '#14b8a622',
        'editor.wordHighlightStrongBackground': '#14b8a633',
        'editor.findMatchBackground': '#F59E0B44',
        'editor.findMatchHighlightBackground': '#F59E0B22',
        'editor.findRangeHighlightBackground': '#14b8a622',
        'editor.hoverHighlightBackground': '#14b8a622',
        'editor.rangeHighlightBackground': '#14b8a622',
        'editorCursor.foreground': '#14b8a6',
        'editorWhitespace.foreground': '#E5E7EB',
        'editorIndentGuide.background': '#E5E7EB',
        'editorIndentGuide.activeBackground': '#D1D5DB',

        // Bracket matching
        'editorBracketMatch.background': '#14b8a622',
        'editorBracketMatch.border': '#14b8a6',

        // Code lens
        'editorCodeLens.foreground': '#9CA3AF',

        // Folding
        'editorGutter.foldingControlForeground': '#9CA3AF',

        // Scrollbar
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#D1D5DB80',
        'scrollbarSlider.hoverBackground': '#9CA3AFB0',
        'scrollbarSlider.activeBackground': '#14b8a6',

        // Minimap
        'minimap.background': '#FFFFFF',
        'minimapSlider.background': '#D1D5DB40',
        'minimapSlider.hoverBackground': '#9CA3AF60',
        'minimapSlider.activeBackground': '#14b8a680',
        'minimap.selectionHighlight': '#14b8a633',
        'minimap.findMatchHighlight': '#F59E0B44',

        // Overview ruler (right side)
        'editorOverviewRuler.background': '#FFFFFF',
        'editorOverviewRuler.border': '#E5E7EB',
        'editorOverviewRuler.selectionHighlightForeground': '#14b8a680',
        'editorOverviewRuler.findMatchForeground': '#F59E0B80',
        'editorOverviewRuler.bracketMatchForeground': '#A78BFA80',

        // Gutter (line numbers area)
        'editorGutter.background': '#FFFFFF',
        'editorGutter.modifiedBackground': '#14b8a6',
        'editorGutter.addedBackground': '#10B981',
        'editorGutter.deletedBackground': '#EF4444',

        // Widget (autocomplete, etc)
        'editorWidget.background': '#FFFFFF',
        'editorWidget.border': '#E5E7EB',
        'editorWidget.foreground': '#1F2937',
        'editorWidget.resizeBorder': '#14b8a6',

        // Hover widget
        'editorHoverWidget.background': '#FFFFFF',
        'editorHoverWidget.border': '#E5E7EB',
        'editorHoverWidget.foreground': '#1F2937',
        'editorHoverWidget.statusBarBackground': '#F9FAFB',

        // Suggest widget
        'editorSuggestWidget.background': '#FFFFFF',
        'editorSuggestWidget.border': '#E5E7EB',
        'editorSuggestWidget.foreground': '#1F2937',
        'editorSuggestWidget.selectedBackground': '#14b8a622',
        'editorSuggestWidget.highlightForeground': '#14b8a6',

        // Peek view (definition preview)
        'peekView.border': '#14b8a6',
        'peekViewEditor.background': '#FFFFFF',
        'peekViewEditor.matchHighlightBackground': '#F59E0B44',
        'peekViewResult.background': '#F9FAFB',
        'peekViewResult.matchHighlightBackground': '#F59E0B44',
        'peekViewResult.selectionBackground': '#14b8a633',
        'peekViewTitle.background': '#F9FAFB',
        'peekViewTitleDescription.foreground': '#6B7280',
        'peekViewTitleLabel.foreground': '#1F2937',
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    setJsonString(value);

    // Try to parse and update config
    try {
      const parsed = JSON.parse(value);
      setIsValid(true);
      onChange(parsed);
    } catch (error) {
      // Invalid JSON - don't update config yet
      setIsValid(false);
    }
  };

  return (
    <div className="report-editor-tab-json">
      {!isValid && (
        <div className="json-error">
          Invalid JSON format. Please fix syntax errors.
        </div>
      )}
      <MonacoEditor
        key={currentTheme}
        height="600px"
        language="json"
        theme={currentTheme === 'light' ? 'cyoda-light' : 'cyoda-neon-dark'}
        value={jsonString}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
          fontSize: 14,
          lineHeight: 22,
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          roundedSelection: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 10, bottom: 10 },
          stickyScroll: {
            enabled: true,
            maxLineCount: 5,
          },
        }}
      />
    </div>
  );
};

export default ReportEditorTabJson;

