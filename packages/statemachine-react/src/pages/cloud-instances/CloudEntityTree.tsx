/**
 * CloudEntityTree — recursive renderer for the cloud entity body (raw JSON).
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.8.1.
 * Why a new component (vs. reusing legacy EntityDetailTree): the legacy
 * component is coupled to the legacy Entity[] flat-fields shape and adapting
 * cloud-JSON → that shape is more code than just rendering the JSON directly.
 */
import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export interface CloudEntityTreeProps {
  value: unknown;
  showEmpty: boolean;
  level?: number;
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  return false;
}

export const CloudEntityTree: React.FC<CloudEntityTreeProps> = ({ value, showEmpty, level = 0 }) => {
  const indent = { paddingLeft: level * 16 };

  if (value === null || value === undefined) {
    return <Text type="secondary" style={indent}>null</Text>;
  }
  if (typeof value !== 'object') {
    return <Text style={indent}>{String(value)}</Text>;
  }
  if (Array.isArray(value)) {
    return (
      <div style={indent}>
        {value.map((item, i) => (
          <div key={i}>
            <CloudEntityTree value={item} showEmpty={showEmpty} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }
  // Object
  return (
    <div style={indent}>
      {Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => showEmpty || !isEmpty(v))
        .map(([k, v]) => (
          <div key={k} style={{ marginBottom: 4 }}>
            <Text strong>{k}:</Text>{' '}
            {(v === null || typeof v !== 'object' || (Array.isArray(v) && v.length === 0))
              ? <CloudEntityTree value={v} showEmpty={showEmpty} level={0} />
              : (
                <div>
                  <CloudEntityTree value={v} showEmpty={showEmpty} level={level + 1} />
                </div>
              )}
          </div>
        ))}
    </div>
  );
};
