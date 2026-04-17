/**
 * ModelPicker — Stage-A picker for the cloud Workflows page.
 *
 * Renders a searchable Ant Design Select populated from `useEntityModelList()`.
 * Each option represents a `(modelName, modelVersion)` pair. Selection emits
 * a `ModelRef` to the parent via `onChange`; null clears the selection.
 */

import React, { useMemo } from 'react';
import { Select } from 'antd';
import { useEntityModelList } from '../../hooks/useStatemachine';
import type { ModelRef } from '../../gateways';

export interface ModelPickerProps {
  value: ModelRef | null;
  onChange: (next: ModelRef | null) => void;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({ value, onChange }) => {
  const { data, isLoading, isError, error } = useEntityModelList();

  const options = useMemo(() => {
    const items = data ?? [];
    // Sort: most-recently-updated first, then alphabetical by name, then highest
    // version first as a final tiebreaker. modelUpdateDate is ISO-8601, so
    // lexical compare is equivalent to chronological. The version tiebreaker
    // matters when two records share a date AND a name (e.g., a same-second
    // version bump), preventing insertion-order surprises.
    return [...items]
      .sort((a, b) => {
        const da = a.modelUpdateDate ?? '';
        const db = b.modelUpdateDate ?? '';
        if (da !== db) return db.localeCompare(da); // recent first
        const byName = a.modelName.localeCompare(b.modelName);
        if (byName !== 0) return byName;
        return b.modelVersion - a.modelVersion; // higher version first
      })
      .map((item) => ({
        value: `${item.modelName}::${item.modelVersion}`,
        label: `${item.modelName} (v${item.modelVersion})`,
        modelName: item.modelName,
        modelVersion: item.modelVersion,
      }));
  }, [data]);

  const selectedKey = value ? `${value.entityName}::${value.modelVersion}` : undefined;

  return (
    <Select
      style={{ minWidth: 320 }}
      placeholder="Select an entity model"
      showSearch
      allowClear
      loading={isLoading}
      status={isError ? 'error' : undefined}
      value={selectedKey}
      onChange={(key) => {
        if (!key) {
          onChange(null);
          return;
        }
        const opt = options.find((o) => o.value === key);
        if (opt) onChange({ entityName: opt.modelName, modelVersion: opt.modelVersion });
      }}
      options={options.map(({ value, label }) => ({ value, label }))}
      filterOption={(input, opt) =>
        (opt?.label as string).toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={
        isError ? `Failed to load: ${(error as Error)?.message ?? 'unknown'}` : 'No models'
      }
    />
  );
};
