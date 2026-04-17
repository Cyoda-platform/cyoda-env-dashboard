/**
 * ConfigView — read-only pretty-printed JSON of the current (in-memory) doc.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-layout-pivot.md §3.8
 */
import React from 'react';
import { useWorkflowEditorStore } from '../storeContext';

export const ConfigView: React.FC = () => {
  const doc = useWorkflowEditorStore((s) => s.current);
  if (!doc) return null;
  return (
    <pre style={{
      background: 'transparent',
      padding: 12,
      borderRadius: 4,
      border: '1px solid var(--ant-color-border, #303030)',
      overflowX: 'auto',
      fontSize: 12,
      lineHeight: 1.4,
    }}>
      {JSON.stringify(doc, null, 2)}
    </pre>
  );
};
