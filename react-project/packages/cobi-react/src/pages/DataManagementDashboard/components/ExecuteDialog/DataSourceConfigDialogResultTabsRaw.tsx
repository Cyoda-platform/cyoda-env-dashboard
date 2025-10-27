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
      rules: [],
      colors: {
        'editor.background': '#1E2A3A',
        'editor.foreground': '#F9FAFB',
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
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
        }}
      />
    </div>
  );
};

export default DataSourceConfigDialogResultTabsRaw;

