/**
 * ReportEditorTabColumns Component
 * Tab for selecting which columns to include in the report
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabColumn.vue
 */

import React, { useMemo } from 'react';
import { Transfer, HelperFormat } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';
import './ReportEditorTabColumns.scss';

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
  // Use full path for key/name (for matching), but short path for title (for display)
  const optionsData = useMemo(() => {
    return cols.map((col) => ({
      '@bean': col['@bean'],
      name: col.alias, // Full path for matching
      key: col.alias,  // Full path for matching
      title: HelperFormat.shortNamePath(col.alias), // Short path for display
    }));
  }, [cols]);

  // Current selected columns
  // Use full path for key/name (for matching), but short path for title (for display)
  const selectedColumns = useMemo(() => {
    return (configDefinition.columns || []).map((col: any) => ({
      '@bean': col['@bean'],
      name: col.name, // Full path for matching
      key: col.name,  // Full path for matching
      title: HelperFormat.shortNamePath(col.name), // Short path for display
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
        fieldLabel="title"
        strLengthRight={40}
        showSearch
      />
    </div>
  );
};

export default ReportEditorTabColumns;

