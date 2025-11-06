/**
 * ReportEditorTabJson Component
 * Tab for viewing/editing raw JSON configuration
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabJson.vue
 */

import React, { useState, useEffect } from 'react';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';
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

  // Define custom theme before editor mounts
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('cyoda-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        // Keywords
        { token: 'keyword', foreground: 'FB923C', fontStyle: 'bold' },
        { token: 'keyword.json', foreground: 'FBBF24' },
        // Strings
        { token: 'string.key.json', foreground: 'F472B6' },
        { token: 'string.value.json', foreground: '34D399' },
        { token: 'string', foreground: '34D399' },
        // Numbers
        { token: 'number', foreground: 'FBBF24' },
        // Delimiters
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
        'editor.inactiveSelectionBackground': '#00D4AA22',
        'editorCursor.foreground': '#00D4AA',
        'editorWhitespace.foreground': '#374151',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#4B5563',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4B5563',
        'scrollbarSlider.activeBackground': '#00D4AA',
      },
    });
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
        height="600px"
        language="json"
        theme="cyoda-dark"
        value={jsonString}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
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
        }}
      />
    </div>
  );
};

export default ReportEditorTabJson;

