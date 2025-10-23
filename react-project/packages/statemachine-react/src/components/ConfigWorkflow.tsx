/**
 * Config Workflow Component
 * Display workflow configuration as formatted JSON with syntax highlighting
 * Migrated from: .old_project/packages/statemachine/src/components/ConfigWorkflow.vue
 */

import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-json';
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

  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    if (workflow) {
      try {
        // Format JSON with 2-space indentation
        const formatted = JSON.stringify(workflow, null, 2);

        // Apply syntax highlighting using Prism
        const highlighted = Prism.highlight(
          formatted,
          Prism.languages.json,
          'json'
        );

        setHighlightedCode(highlighted);
      } catch (err) {
        console.error('Error formatting workflow JSON:', err);
        setHighlightedCode('Error formatting workflow data');
      }
    }
  }, [workflow]);

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
        style={{ marginBottom: '16px' }}
      />
      
      <pre
        className="language-json"
        style={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '16px',
          maxHeight: '600px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.5',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
          margin: 0,
        }}
      >
        <code
          className="language-json"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default ConfigWorkflow;

