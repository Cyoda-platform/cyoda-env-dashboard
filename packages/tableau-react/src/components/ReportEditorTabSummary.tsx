/**
 * ReportEditorTabSummary Component
 * Tab for configuring report aggregations/summaries
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabSummary.vue
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Transfer, Select } from 'antd';
import type { TransferProps } from 'antd';
import { HelperFormat } from '@cyoda/ui-lib-react';
import type { ReportDefinition, ReportColumn } from '../types';
import './ReportEditorTabSummary.scss';

// Number types that support all aggregation functions
const NUMBER_TYPES = ['Long', 'Double', 'Integer', 'Float'];

interface SummaryItem {
  column: {
    '@bean': string;
    name: string;
  };
  aggregation: string;
  key: string;
  title: string;
  typeShort?: string;
}

interface ReportEditorTabSummaryProps {
  cols: any[];
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
}

const ReportEditorTabSummary: React.FC<ReportEditorTabSummaryProps> = ({
  cols,
  configDefinition,
  onChange,
}) => {
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);

  // Prepare options data from cols
  // Use full path for key (for matching), but short path for title (for display)
  const optionsData = useMemo(() => {
    return cols.map((col) => ({
      column: {
        '@bean': col['@bean'],
        name: col.alias, // Full path
      },
      aggregation: 'COUNT',
      key: col.alias, // Full path for matching
      title: HelperFormat.shortNamePath(col.alias), // Short path for display
      typeShort: col.typeShort,
    }));
  }, [cols]);

  // Initialize summary data from config
  // Use full path for key (for matching), but short path for title (for display)
  useEffect(() => {
    if (configDefinition.summary && configDefinition.summary.length > 0) {
      const data = configDefinition.summary.map((sum: any) => {
        // Summary format: [[column, [aggregation]]]
        const column = sum[0];
        const aggregation = sum[1]?.[0] || 'COUNT';
        const col = cols.find((c) => c.alias === column.name);

        return {
          column,
          aggregation,
          key: column.name, // Full path for matching
          title: HelperFormat.shortNamePath(column.name), // Short path for display
          typeShort: col?.typeShort,
        };
      });
      setSummaryData(data);
    }
  }, [configDefinition.summary, cols]);

  // Get target keys (selected items)
  const targetKeys = useMemo(() => {
    return summaryData.map((item) => item.key);
  }, [summaryData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    // Find items from optionsData
    const newSummary = newTargetKeys.map((key) => {
      // Check if item already exists in summaryData (preserve aggregation)
      const existing = summaryData.find((item) => item.key === key);
      if (existing) {
        return existing;
      }
      // Otherwise create new item from optionsData
      const option = optionsData.find((item) => item.key === key);
      return option || {
        column: { '@bean': '', name: key as string },
        aggregation: 'COUNT',
        key: key as string,
        title: HelperFormat.shortNamePath(key as string),
      };
    });

    setSummaryData(newSummary);

    // Update config - format: [[column, [aggregation]]]
    const summary: Array<[ReportColumn, string[]]> = newSummary.map((item) => [
      item.column,
      [item.aggregation],
    ]);
    onChange({ summary });
  };

  const handleAggregationChange = (key: string, aggregation: string) => {
    const newSummary = summaryData.map((item) => {
      if (item.key === key) {
        return { ...item, aggregation };
      }
      return item;
    });

    setSummaryData(newSummary);

    // Update config
    const summary: Array<[ReportColumn, string[]]> = newSummary.map((item) => [
      item.column,
      [item.aggregation],
    ]);
    onChange({ summary });
  };

  // Get available aggregation options based on column type
  const getAggregationOptions = (typeShort?: string): string[] => {
    if (typeShort && NUMBER_TYPES.includes(typeShort)) {
      return ['MAX', 'MIN', 'COUNT', 'COUNT_UNIQUE', 'SUM', 'AVG'];
    }
    return ['MAX', 'MIN', 'COUNT', 'COUNT_UNIQUE'];
  };

  // Custom render for items in the right panel
  const renderItem: TransferProps['render'] = (item) => {
    const summaryItem = summaryData.find((s) => s.key === item.key);
    const isInTarget = targetKeys.includes(item.key);

    if (isInTarget && summaryItem) {
      const options = getAggregationOptions(summaryItem.typeShort);

      return (
        <div className="summary-item">
          <span className="summary-item__label">{item.title}</span>
          <Select
            className="summary-item__select"
            size="small"
            value={summaryItem.aggregation}
            onChange={(value) => handleAggregationChange(item.key, value)}
            options={options.map((opt) => ({ label: opt, value: opt }))}
            popupClassName="report-summary-dropdown"
            dropdownStyle={{ minWidth: '200px' }}
          />
        </div>
      );
    }

    return item.title;
  };

  return (
    <div className="report-editor-tab-summary">
      <Transfer
        dataSource={optionsData}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={renderItem}
        titles={['Possible summary values', 'Selected summary values']}
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

export default ReportEditorTabSummary;

