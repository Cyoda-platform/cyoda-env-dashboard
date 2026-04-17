/**
 * Recursive editor for cloud QueryCondition values (simple / group / function).
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.6
 *
 * This task (Task 9) implements the empty + simple branches. Group + function
 * land in Tasks 10 + 11; type-switch confirm in Task 12.
 */
import React from 'react';
import { App, Button, Input, Select, Space, Typography } from 'antd';
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

export const QueryConditionEditor: React.FC<QueryConditionEditorProps> = ({ value, onChange }) => {
  if (value === undefined) {
    return (
      <Button onClick={() => onChange({ type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' } as any)}>
        + Add criterion
      </Button>
    );
  }

  const { modal } = App.useApp();
  const t = (value as any).type;

  function isDestructiveSwitch(from: any, _toType: string): boolean {
    if (from.type === 'group' && (from.conditions?.length ?? 0) > 0) return true;
    if (from.type === 'function' && (from.function?.config || from.function?.criterion)) return true;
    return false;
  }

  function blankFor(toType: string): QueryCondition {
    if (toType === 'simple') return { type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' } as any;
    if (toType === 'group') return { type: 'group', operator: 'AND', conditions: [] } as any;
    return { type: 'function', function: { name: '' } } as any;
  }

  const handleTypeChange = (toType: string) => {
    if (toType === t) return;
    if (isDestructiveSwitch(value, toType)) {
      modal.confirm({
        title: 'Switch condition type',
        content: 'Switching the condition type will discard the nested children. Continue?',
        okText: 'Switch',
        cancelText: 'Cancel',
        onOk: () => onChange(blankFor(toType)),
      });
    } else {
      onChange(blankFor(toType));
    }
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Text strong>Type:</Text>
        <Select
          style={{ width: 120 }}
          value={t}
          onChange={handleTypeChange}
          options={[{ value: 'simple', label: 'simple' }, { value: 'group', label: 'group' }, { value: 'function', label: 'function' }]}
        />
        <Button size="small" onClick={() => onChange(undefined)}>Remove criterion</Button>
      </Space>
      {t === 'simple' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="JSONPath e.g. $.field"
            value={(value as any).jsonPath ?? ''}
            onChange={(e) => onChange({ ...(value as any), jsonPath: e.target.value })}
          />
          <Select
            style={{ width: 240 }}
            value={(value as any).operation}
            onChange={(op) => onChange({ ...(value as any), operation: op })}
            options={OPERATION_OPTIONS}
          />
          <Input
            placeholder="Value"
            value={(value as any).value ?? ''}
            onChange={(e) => onChange({ ...(value as any), value: e.target.value })}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Compared as a string. For typed comparisons (numeric, boolean), use a function condition.
          </Text>
        </Space>
      )}
      {t === 'group' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: 120 }}
            value={(value as any).operator}
            onChange={(op) => onChange({ ...(value as any), operator: op })}
            options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }, { value: 'NOT', label: 'NOT' }]}
          />
          {((value as any).conditions ?? []).map((c: QueryCondition, i: number) => (
            <div key={i} style={{ paddingLeft: 16, borderLeft: '2px solid #eee' }}>
              <QueryConditionEditor
                value={c}
                onChange={(next) => {
                  const arr = [...((value as any).conditions ?? [])];
                  if (next === undefined) arr.splice(i, 1);
                  else arr[i] = next;
                  onChange({ ...(value as any), conditions: arr });
                }}
              />
            </div>
          ))}
          <Button onClick={() => onChange({
            ...(value as any),
            conditions: [...((value as any).conditions ?? []), { type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' }],
          })}>
            + Add condition
          </Button>
        </Space>
      )}
      {t === 'function' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Function name"
            value={(value as any).function?.name ?? ''}
            onChange={(e) => onChange({
              ...(value as any),
              function: { ...((value as any).function ?? {}), name: e.target.value },
            })}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Optional: nested criterion (cheap pre-check) and config fields are inferred from
            the existing value structure. To add them, edit the workflow JSON externally for now.
          </Text>
        </Space>
      )}
    </Space>
  );
};
