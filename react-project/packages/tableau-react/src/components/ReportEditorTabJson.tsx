/**
 * ReportEditorTabJson Component
 * Tab for viewing/editing raw JSON configuration
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabJson.vue
 */

import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
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
        theme="vs-light"
        value={jsonString}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          roundedSelection: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default ReportEditorTabJson;

