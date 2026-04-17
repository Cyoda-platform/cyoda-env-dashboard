/**
 * Recursive editor for cloud QueryCondition values (simple / group / function).
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.6
 *
 * This task (Task 9) implements the empty + simple branches. Group + function
 * land in Tasks 10 + 11; type-switch confirm in Task 12.
 */
import React, { useState } from 'react';
import { Button, Select, Space, Typography } from 'antd';
import type { QueryCondition } from '../../gateways';

const { Text } = Typography;

export interface QueryConditionEditorProps {
  value: QueryCondition | undefined;
  onChange: (next: QueryCondition | undefined) => void;
}

const STRING_OPS = ['EQUALS', 'NOT_EQUAL', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH'];
const NUMERIC_OPS = ['LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL'];
const COLLECTION_OPS = ['IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'];

const OPERATION_OPTIONS = [
  { label: 'String', options: STRING_OPS.map((v) => ({ value: v, label: v })) },
  { label: 'Numeric', options: NUMERIC_OPS.map((v) => ({ value: v, label: v })) },
  { label: 'Collection', options: COLLECTION_OPS.map((v) => ({ value: v, label: v })) },
];

interface SimpleCondition {
  type: 'simple';
  jsonPath: string;
  operation: string;
  value: string;
}

const SimpleConditionEditor: React.FC<{
  condition: SimpleCondition;
  onChange: (next: QueryCondition) => void;
}> = ({ condition, onChange }) => {
  const [jsonPath, setJsonPath] = useState(condition.jsonPath);
  const [condValue, setCondValue] = useState(condition.value);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <input
        placeholder="JSONPath e.g. $.field"
        value={jsonPath}
        onChange={(e) => {
          setJsonPath(e.target.value);
          onChange({ ...condition, jsonPath: e.target.value } as any);
        }}
      />
      <Select
        style={{ width: 240 }}
        value={condition.operation}
        onChange={(op) => onChange({ ...condition, operation: op } as any)}
        options={OPERATION_OPTIONS}
      />
      <input
        placeholder="Value"
        value={condValue}
        onChange={(e) => {
          setCondValue(e.target.value);
          onChange({ ...condition, value: e.target.value } as any);
        }}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        Compared as a string. For typed comparisons (numeric, boolean), use a function condition.
      </Text>
    </Space>
  );
};

export const QueryConditionEditor: React.FC<QueryConditionEditorProps> = ({ value, onChange }) => {
  if (value === undefined) {
    return (
      <Button onClick={() => onChange({ type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' } as any)}>
        + Add criterion
      </Button>
    );
  }

  const t = (value as any).type;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Text strong>Type:</Text>
        <Text>{t}</Text>
        <Button size="small" onClick={() => onChange(undefined)}>Remove criterion</Button>
      </Space>
      {t === 'simple' && (
        <SimpleConditionEditor
          condition={value as any}
          onChange={onChange}
        />
      )}
    </Space>
  );
};
