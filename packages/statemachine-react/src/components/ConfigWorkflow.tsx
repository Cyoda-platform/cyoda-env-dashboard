/**
 * Config Workflow Component
 * Display workflow configuration as formatted JSON with syntax highlighting
 * Migrated from: .old_project/packages/statemachine/src/components/ConfigWorkflow.vue
 *
 * Updated to use Monaco Editor instead of Prism.js for unified UI and better functionality
 */

import React from 'react';
import { Spin, Alert } from 'antd';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';
import { useWorkflow } from '../hooks/useStatemachine';
import type { PersistedType } from '../types';

interface ConfigWorkflowProps {
  workflowId: string;
  persistedType: PersistedType;
}

export const ConfigWorkflow: React.FC<ConfigWorkflowProps> = ({
  workflowId,
  persistedType,
}) => {
  const { data: workflow, isLoading, error } = useWorkflow(
    persistedType,
    workflowId,
    !!workflowId
  );

  // Define custom Neon Dark theme before editor mounts
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('cyoda-neon-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // JSON specific tokens
        { token: 'string.key.json', foreground: 'EC4899' }, // Neon Pink for JSON keys
        { token: 'string.value.json', foreground: '14B8A6' }, // Neon Teal for JSON values
        { token: 'number.json', foreground: 'F59E0B' }, // Neon Amber for numbers
        { token: 'keyword.json', foreground: 'F59E0B' }, // Neon Amber for true/false/null
        { token: 'delimiter.bracket.json', foreground: 'A78BFA' }, // Neon Purple for {}
        { token: 'delimiter.array.json', foreground: 'F59E0B' }, // Neon Amber for []
        { token: 'delimiter.colon.json', foreground: 'A8B5C8' }, // Light gray for :
        { token: 'delimiter.comma.json', foreground: 'A8B5C8' }, // Light gray for ,
        // Fallback tokens
        { token: 'string', foreground: '14B8A6' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'keyword', foreground: 'F59E0B' },
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#E0E0E0',
        'editorLineNumber.foreground': '#6B7280',
        'editorLineNumber.activeForeground': '#14b8a6',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#334155',
        'editor.inactiveSelectionBackground': '#1e293b',
        'editorCursor.foreground': '#14b8a6',
        'editorWhitespace.foreground': '#374151',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#4b5563',
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading workflow configuration..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Configuration"
        description="Failed to load workflow configuration. Please try again."
        type="error"
        showIcon
      />
    );
  }

  if (!workflow) {
    return (
      <Alert
        message="No Configuration Available"
        description="Workflow configuration data is not available."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <Alert
        message="Workflow Configuration"
        description="This is the raw JSON configuration of the workflow. You can use this for debugging or exporting the workflow structure."
        type="info"
        showIcon
        style={{
          marginBottom: '16px',
          backgroundColor: '#1e293b',
          border: '1px solid #374151',
        }}
      />

      <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
        <MonacoEditor
          height="600px"
          language="json"
          theme="cyoda-neon-dark"
          value={JSON.stringify(workflow, null, 2)}
          beforeMount={handleEditorWillMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
            fontSize: 14,
            lineHeight: 22,
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: false,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 10, bottom: 10 },
            contextmenu: true,
            selectionHighlight: true,
            occurrencesHighlight: 'singleFile',
            renderLineHighlight: 'all',
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
          }}
        />
      </div>
    </div>
  );
};

export default ConfigWorkflow;

