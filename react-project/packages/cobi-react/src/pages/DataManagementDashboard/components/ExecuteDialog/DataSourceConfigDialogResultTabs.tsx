import React from 'react';
import { Tabs, Divider } from 'antd';
import DataToClipboard from '../../../../components/DataToClipboard/DataToClipboard';
import DataSourceConfigDialogResultTabsData from './DataSourceConfigDialogResultTabsData';
import DataSourceConfigDialogResultTabsRaw from './DataSourceConfigDialogResultTabsRaw';
import DataSourceConfigDialogResultTabsStatistics from './DataSourceConfigDialogResultTabsStatistics';
import DataSourceConfigDialogResultTabsRawJSONResponse from './DataSourceConfigDialogResultTabsRawJSONResponse';
import './DataSourceConfigDialogResultTabs.css';

interface DataSourceConfigDialogResultTabsProps {
  result: any;
  requestId: string;
}

const DataSourceConfigDialogResultTabs: React.FC<DataSourceConfigDialogResultTabsProps> = ({
  result,
  requestId,
}) => {
  const tabItems = [];

  // Data tab
  if (result.data && result.data.length > 0) {
    tabItems.push({
      key: 'data',
      label: 'Data',
      children: <DataSourceConfigDialogResultTabsData data={result.data} />,
    });
  }

  // Errors tab
  if (result.errors && result.errors.length > 0) {
    tabItems.push({
      key: 'errors',
      label: 'Errors',
      children: <DataSourceConfigDialogResultTabsRaw data={result.errors} />,
    });
  }

  // Mapping Warnings tab
  if (result.mappingWarnings && result.mappingWarnings.length > 0) {
    tabItems.push({
      key: 'mappingWarnings',
      label: 'Mapping Warnings',
      children: <DataSourceConfigDialogResultTabsRaw data={result.mappingWarnings} />,
    });
  }

  // Mapping Statistics tab
  if (result.mappingStatistics && result.mappingStatistics.length > 0) {
    tabItems.push({
      key: 'mappingStatistics',
      label: 'Mapping Statistics',
      children: <DataSourceConfigDialogResultTabsStatistics data={result.mappingStatistics} />,
    });
  }

  // Requests Tree tab
  if (result.requestsTree && Object.keys(result.requestsTree).length > 0) {
    tabItems.push({
      key: 'requestsTree',
      label: 'Requests Tree',
      children: <DataSourceConfigDialogResultTabsRaw data={result.requestsTree} />,
    });
  }

  // JSON Response tab (always shown)
  tabItems.push({
    key: 'jsonResponse',
    label: 'JSON Response',
    children: <DataSourceConfigDialogResultTabsRawJSONResponse data={result} />,
  });

  return (
    <div className="data-source-config-dialog-result-tabs">
      <div className="status">
        <strong>State:</strong> {result.state || 'N/A'}
      </div>
      {requestId && (
        <div className="request-uuid">
          <strong>Request UUID:</strong> <DataToClipboard value={requestId} />
        </div>
      )}
      <Divider />
      <Tabs items={tabItems} />
    </div>
  );
};

export default DataSourceConfigDialogResultTabs;

