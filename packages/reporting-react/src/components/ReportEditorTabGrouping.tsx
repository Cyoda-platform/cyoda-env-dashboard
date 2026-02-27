/**
 * ReportEditorTabGrouping Component
 * Tab for configuring report grouping
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabGrouping.vue
 */

import React, { useMemo, useEffect } from 'react';
import { Form, Switch, Divider } from 'antd';
import { Transfer, HelperFormat } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';
import './ReportEditorTabGrouping.scss';

interface ReportEditorTabGroupingProps {
  cols: any[];
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
}

const ReportEditorTabGrouping: React.FC<ReportEditorTabGroupingProps> = ({
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

  // Current selected grouping
  // Use full path for key/name (for matching), but short path for title (for display)
  const selectedGrouping = useMemo(() => {
    return (configDefinition.grouping || []).map((group: any) => ({
      '@bean': group['@bean'],
      name: group.name, // Full path for matching
      key: group.name,  // Full path for matching
      title: HelperFormat.shortNamePath(group.name), // Short path for display
    }));
  }, [configDefinition.grouping]);

  const handleGroupingChange = (selected: any[]) => {
    const grouping = selected.map((item) => ({
      '@bean': item['@bean'],
      name: item.name,
    }));
    onChange({ grouping });
  };

  const handleHierarchyChange = (checked: boolean) => {
    onChange({
      hierarhyEnable: checked,
      reportVersion: checked ? 1 : 0,
    });
  };

  // Sync reportVersion with hierarhyEnable
  useEffect(() => {
    if (configDefinition.hierarhyEnable !== undefined) {
      const reportVersion = configDefinition.hierarhyEnable ? 1 : 0;
      if (configDefinition.reportVersion !== reportVersion) {
        onChange({ reportVersion });
      }
    }
  }, [configDefinition.hierarhyEnable, configDefinition.reportVersion, onChange]);

  return (
    <div className="report-editor-tab-grouping">
      <Form layout="inline" className="form-settings">
        <Form.Item label="Hierarchy Enable">
          <Switch
            checked={configDefinition.hierarhyEnable || false}
            onChange={handleHierarchyChange}
          />
        </Form.Item>
      </Form>

      <Divider />

      <Transfer
        titles={['Possible grouping values', 'Selected grouping values']}
        optionsData={optionsData}
        value={selectedGrouping}
        onChange={handleGroupingChange}
        fieldKey="name"
        fieldLabel="title"
        strLengthRight={40}
        showSearch
      />
    </div>
  );
};

export default ReportEditorTabGrouping;

