/**
 * ModelPicker — type-ahead AutoComplete for environments with many models.
 *
 * Display format: `{modelName}.{modelVersion}` (sorted by name asc, then version desc).
 * Empty input shows nothing; typing filters by substring (case-insensitive).
 */

import React, { useMemo, useState } from 'react';
import { AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useEntityModelList } from '../../hooks/useStatemachine';
import type { ModelRef } from '../../gateways';

export interface ModelPickerProps {
  value: ModelRef | null;
  onChange: (next: ModelRef | null) => void;
}

const formatModel = (name: string, version: number): string => `${name}.${version}`;

export const ModelPicker: React.FC<ModelPickerProps> = ({ value, onChange }) => {
  const { data, isLoading, isError, error } = useEntityModelList();
  const [text, setText] = useState<string>(value ? formatModel(value.entityName, value.modelVersion) : '');

  const sorted = useMemo(() => {
    const items = data ?? [];
    return [...items].sort((a, b) => {
      const byName = a.modelName.localeCompare(b.modelName);
      if (byName !== 0) return byName;
      return b.modelVersion - a.modelVersion; // newest version first within a name
    });
  }, [data]);

  const options = useMemo(() => {
    const needle = text.trim().toLowerCase();
    const matches = needle
      ? sorted.filter((m) => formatModel(m.modelName, m.modelVersion).toLowerCase().includes(needle))
      : sorted;
    return matches.slice(0, 100).map((m) => ({
      value: formatModel(m.modelName, m.modelVersion),
      label: formatModel(m.modelName, m.modelVersion),
      modelName: m.modelName,
      modelVersion: m.modelVersion,
    }));
  }, [sorted, text]);

  return (
    <AutoComplete
      style={{ minWidth: 320 }}
      value={text}
      options={options}
      onChange={(v) => {
        const next = v ?? '';
        setText(next);
        if (!next) {
          onChange(null);
          return;
        }
        const match = sorted.find((m) => formatModel(m.modelName, m.modelVersion) === next);
        if (match) onChange({ entityName: match.modelName, modelVersion: match.modelVersion });
      }}
      onBlur={() => {
        // Snap back to the selected value's display if the user typed garbage
        if (value) setText(formatModel(value.entityName, value.modelVersion));
        else setText('');
      }}
      placeholder="Type to filter models (e.g. NDA.1)"
      allowClear
      suffixIcon={<SearchOutlined />}
      notFoundContent={
        isError ? `Failed to load: ${(error as Error)?.message ?? 'unknown'}` : isLoading ? 'Loading…' : 'No models'
      }
    />
  );
};
