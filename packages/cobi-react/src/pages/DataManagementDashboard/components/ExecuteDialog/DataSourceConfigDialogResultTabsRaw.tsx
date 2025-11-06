import React from 'react';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';

interface DataSourceConfigDialogResultTabsRawProps {
  data: any;
}

const DataSourceConfigDialogResultTabsRaw: React.FC<DataSourceConfigDialogResultTabsRawProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);

  // Define custom theme
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('cyoda-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FB923C', fontStyle: 'bold' },
        { token: 'keyword.json', foreground: 'FBBF24' },
        { token: 'string.key.json', foreground: 'F472B6' },
        { token: 'string.value.json', foreground: '34D399' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
        { token: 'delimiter.array.json', foreground: 'FBBF24' },
        { token: 'delimiter', foreground: 'A8B5C8' },
      ],
      colors: {
        'editor.background': '#1E2A3A',
        'editor.foreground': '#E0E0E0',
        'editorLineNumber.foreground': '#6B7280',
        'editorLineNumber.activeForeground': '#00D4AA',
        'editor.lineHighlightBackground': '#243142',
        'editor.selectionBackground': '#00D4AA33',
        'editorCursor.foreground': '#00D4AA',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4B5563',
        'scrollbarSlider.activeBackground': '#00D4AA',
      },
    });
  };

  return (
    <div style={{ height: '500px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <MonacoEditor
        height="100%"
        language="json"
        theme="cyoda-dark"
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

export default DataSourceConfigDialogResultTabsRaw;

