import React, { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import './CodeEditor.css';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light';
  options?: editor.IStandaloneEditorConstructionOptions;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
  theme = 'vs-dark',
  options = {},
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // Define custom Neon Dark theme
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

    // Configure JavaScript/TypeScript defaults
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
    });
  };

  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    readOnly,
    fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
    fontSize: 14,
    lineHeight: 22,
    fontLigatures: true,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    roundedSelection: false,
    formatOnPaste: true,
    formatOnType: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    padding: { top: 10, bottom: 10 },
    ...options,
  };

  return (
    <div className="code-editor-wrapper">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="cyoda-neon-dark"
        options={defaultOptions}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;

