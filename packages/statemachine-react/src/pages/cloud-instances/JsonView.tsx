import React, { useMemo } from 'react';
import './JsonView.css';

export interface JsonViewProps {
  value: unknown;
  maxHeight?: number | string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlight = (json: string): string => {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match: string, str?: string, colon?: string, bool?: string) => {
      if (str !== undefined) {
        return colon
          ? `<span class="json-key">${str}</span>${colon}`
          : `<span class="json-string">${str}</span>`;
      }
      if (bool !== undefined) {
        return `<span class="json-${bool === 'null' ? 'null' : 'bool'}">${match}</span>`;
      }
      return `<span class="json-number">${match}</span>`;
    },
  );
};

export const JsonView: React.FC<JsonViewProps> = ({ value, maxHeight = 600 }) => {
  const html = useMemo(() => highlight(JSON.stringify(value ?? {}, null, 2)), [value]);
  return (
    <pre
      className="cloud-json-view"
      style={{
        margin: 0,
        padding: 12,
        fontSize: 12,
        lineHeight: 1.5,
        maxHeight,
        overflow: 'auto',
        background: 'var(--token-color-bg-elevated, #1e1e1e)',
        border: '1px solid var(--token-color-border, #303030)',
        borderRadius: 4,
        fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
