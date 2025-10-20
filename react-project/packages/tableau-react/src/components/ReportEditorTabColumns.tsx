/**
 * ReportEditorTabColumns Component
 * Tab for selecting which columns to include in the report
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabColumn.vue
 */

import React, { useMemo } from 'react';
import { Transfer } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';

interface ReportEditorTabColumnsProps {
  cols: any[];
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
}

const ReportEditorTabColumns: React.FC<ReportEditorTabColumnsProps> = ({
  cols,
  configDefinition,
  onChange,
}) => {
  // Prepare options data from cols
  const optionsData = useMemo(() => {
    return cols.map((col) => ({
      '@bean': col['@bean'],
      name: col.alias,
      key: col.alias,
      title: col.alias,
    }));
  }, [cols]);

  // Current selected columns
  const selectedColumns = useMemo(() => {
    return (configDefinition.columns || []).map((col: any) => ({
      '@bean': col['@bean'],
      name: col.name,
      key: col.name,
      title: col.name,
    }));
  }, [configDefinition.columns]);

  const handleChange = (selected: any[]) => {
    const columns = selected.map((item) => ({
      '@bean': item['@bean'],
      name: item.name,
    }));
    onChange({ columns });
  };

  return (
    <div className="report-editor-tab-columns">
      <Transfer
        titles={['Possible columns values', 'Selected columns values']}
        optionsData={optionsData}
        value={selectedColumns}
        onChange={handleChange}
        fieldKey="name"
        fieldLabel="name"
        strLengthRight={40}
        showSearch
      />
    </div>
  );
};

export default ReportEditorTabColumns;

