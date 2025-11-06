import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { FilterGroup, ColumnInfo } from './types';
import FilterBuilderGroup from './FilterBuilderGroup';
import './FilterBuilder.css';

interface FilterBuilderProps {
  entityFilter: FilterGroup;
  cols: ColumnInfo[];
  showErrors?: boolean;
  readOnly?: boolean;
  onChange: (filter: FilterGroup) => void;
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  entityFilter,
  cols,
  showErrors = false,
  readOnly = false,
  onChange,
}) => {
  const [localFilter, setLocalFilter] = useState<FilterGroup>(entityFilter);

  useEffect(() => {
    setLocalFilter(entityFilter);
  }, [entityFilter]);

  const handleChange = () => {
    onChange(localFilter);
  };

  return (
    <div className="filter-builder">
      {cols.length === 0 && (
        <Alert
          message="No Fields Available"
          description="Please select an entity class first to see available fields for filtering."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {cols.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: 8 }}>
              Build filter conditions to limit which entities are processed during data mapping.
              Use groups to combine multiple conditions with AND/OR logic.
            </p>
          </div>

          <FilterBuilderGroup
            condition={localFilter}
            cols={cols}
            showErrors={showErrors}
            readOnly={readOnly}
            onChange={handleChange}
          />

          {showErrors && localFilter.conditions.length === 0 && (
            <Alert
              message="No Conditions"
              description="Please add at least one condition to the filter."
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FilterBuilder;

