import React from 'react';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';

interface DataSourceConfigDialogResultTabsRawJSONResponseProps {
  data: any;
}

const DataSourceConfigDialogResultTabsRawJSONResponse: React.FC<DataSourceConfigDialogResultTabsRawJSONResponseProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);

  // Define custom Neon Dark theme
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('cyoda-neon-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'keyword.json', foreground: 'F59E0B' },
        { token: 'string.key.json', foreground: 'EC4899' },
        { token: 'string.value.json', foreground: '14B8A6' },
        { token: 'string', foreground: '14B8A6' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
        { token: 'delimiter.array.json', foreground: 'F59E0B' },
        { token: 'delimiter', foreground: 'A8B5C8' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#E0E0E0',
        'editorLineNumber.foreground': '#6B7280',
        'editorLineNumber.activeForeground': '#14b8a6',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#14b8a633',
        'editorCursor.foreground': '#14b8a6',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4B5563',
        'scrollbarSlider.activeBackground': '#14b8a6',
      },
    });
  };

  return (
    <div style={{ height: '500px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <MonacoEditor
        height="100%"
        language="json"
        theme="cyoda-neon-dark"
        value={jsonString}
        beforeMount={handleEditorWillMount}
        options={{
          readOnly: true,
          fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
          fontSize: 14,
          lineHeight: 22,
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
};

export default DataSourceConfigDialogResultTabsRawJSONResponse;

