/**
 * ReportEditorTabSorting Component
 * Tab for configuring report sorting
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabSorting.vue
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Transfer, Switch } from 'antd';
import type { TransferProps } from 'antd';
import { HelperFormat } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';
import './ReportEditorTabSorting.scss';

interface SortingItem {
  column: {
    '@bean': string;
    name: string;
  };
  reverse: boolean;
  key: string;
  title: string;
}

interface ReportEditorTabSortingProps {
  cols: any[];
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
}

const ReportEditorTabSorting: React.FC<ReportEditorTabSortingProps> = ({
  cols,
  configDefinition,
  onChange,
}) => {
  const [sortingData, setSortingData] = useState<SortingItem[]>([]);

  // Prepare options data from cols
  // Use full path for key (for matching), but short path for title (for display)
  const optionsData = useMemo(() => {
    return cols.map((col) => ({
      column: {
        '@bean': col['@bean'],
        name: col.alias, // Full path
      },
      reverse: false,
      key: col.alias, // Full path for matching
      title: HelperFormat.shortNamePath(col.alias), // Short path for display
    }));
  }, [cols]);

  // Initialize sorting data from config
  // Use full path for key (for matching), but short path for title (for display)
  useEffect(() => {
    if (configDefinition.sorting && configDefinition.sorting.length > 0) {
      const data = configDefinition.sorting.map((sort: any) => ({
        column: sort.column,
        reverse: sort.reverse || false,
        key: sort.column.name, // Full path for matching
        title: HelperFormat.shortNamePath(sort.column.name), // Short path for display
      }));
      setSortingData(data);
    }
  }, [configDefinition.sorting]);

  // Get target keys (selected items)
  const targetKeys = useMemo(() => {
    return sortingData.map((item) => item.key);
  }, [sortingData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    // Find items from optionsData
    const newSorting = newTargetKeys.map((key) => {
      // Check if item already exists in sortingData (preserve reverse state)
      const existing = sortingData.find((item) => item.key === key);
      if (existing) {
        return existing;
      }
      // Otherwise create new item from optionsData
      const option = optionsData.find((item) => item.key === key);
      return option || {
        column: { '@bean': '', name: key as string },
        reverse: false,
        key: key as string,
        title: HelperFormat.shortNamePath(key as string)
      };
    });

    setSortingData(newSorting);

    // Update config
    const sorting = newSorting.map((item) => ({
      column: item.column,
      reverse: item.reverse,
    }));
    onChange({ sorting });
  };

  const handleReverseChange = (key: string, checked: boolean) => {
    const newSorting = sortingData.map((item) => {
      if (item.key === key) {
        return { ...item, reverse: checked };
      }
      return item;
    });

    setSortingData(newSorting);

    // Update config
    const sorting = newSorting.map((item) => ({
      column: item.column,
      reverse: item.reverse,
    }));
    onChange({ sorting });
  };

  // Custom render for items in the right panel
  const renderItem: TransferProps['render'] = (item) => {
    const sortItem = sortingData.find((s) => s.key === item.key);
    const isInTarget = targetKeys.includes(item.key);

    if (isInTarget && sortItem) {
      return (
        <div className="sorting-item">
          <span className="sorting-item__label">{item.title}</span>
          <div className="sorting-item__control">
            <span className="sorting-item__control-label">Reverse</span>
            <Switch
              size="small"
              checked={sortItem.reverse}
              onChange={(checked) => handleReverseChange(item.key, checked)}
            />
          </div>
        </div>
      );
    }

    return item.title;
  };

  return (
    <div className="report-editor-tab-sorting">
      <Transfer
        dataSource={optionsData}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={renderItem}
        titles={['Possible sorting values', 'Selected sorting values']}
        showSearch
        listStyle={{
          width: 500,
          height: 500,
        }}
        operations={['', '']}
        locale={{
          itemUnit: 'item',
          itemsUnit: 'items',
          searchPlaceholder: 'Search',
        }}
      />
    </div>
  );
};

export default ReportEditorTabSorting;

