/**
 * AdvancedSearchDrawer — JSON textarea that submits the body verbatim to /search/direct.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.7
 */
import React, { useMemo, useState } from 'react';
import { Alert, Button, Drawer, Input, Space, Typography } from 'antd';

const { Text } = Typography;

const TEMPLATE = JSON.stringify({
  type: 'group',
  operator: 'AND',
  conditions: [
    { type: 'simple', jsonPath: '$.field', operation: 'EQUALS', value: '...' },
  ],
}, null, 2);

export interface AdvancedSearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSearch: (criterion: unknown) => void;
}

export const AdvancedSearchDrawer: React.FC<AdvancedSearchDrawerProps> = ({ open, onClose, onSearch }) => {
  const [text, setText] = useState(TEMPLATE);
  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(text) };
    } catch (e: any) {
      return { ok: false as const, error: e.message as string };
    }
  }, [text]);

  return (
    <Drawer
      title="Advanced Search"
      open={open}
      onClose={onClose}
      width={720}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" disabled={!parsed.ok} onClick={() => parsed.ok && onSearch(parsed.value)}>Search</Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">
          Paste a search criterion (group / simple / function / lifecycle).{' '}
          <a href="https://docs.cyoda.net/guides/query-api/" target="_blank" rel="noreferrer">Documentation</a>
        </Text>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
        {!parsed.ok && <Alert type="error" message={`Invalid JSON: ${parsed.error}`} />}
      </Space>
    </Drawer>
  );
};
