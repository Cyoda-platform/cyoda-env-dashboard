/**
 * Processing Events Error View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsErrorView/PmProcessingEventsErrorView.vue
 */

import React, { useState } from 'react';
import { Spin } from 'antd';
import ProcessingEventsErrorViewFilter from './ProcessingEventsErrorViewFilter';
import ProcessingEventsErrorViewTable from './ProcessingEventsErrorViewTable';
import { useProcessingQueueEventsError } from '../../hooks';

export const ProcessingEventsErrorView: React.FC = () => {
  const [filterValues, setFilterValues] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);

  const { refetch, isLoading } = useProcessingQueueEventsError(
    { params: filterValues },
    {
      enabled: false,
      onSuccess: (data: any) => {
        setTableData(data?.rows || []);
      },
    }
  );

  const handleFilterChange = async (values: any) => {
    setFilterValues(values);
    await refetch();
  };

  return (
    <Spin spinning={isLoading}>
      <ProcessingEventsErrorViewFilter isLoading={isLoading} onChange={handleFilterChange} />
      <ProcessingEventsErrorViewTable tableData={tableData} />
    </Spin>
  );
};

export default ProcessingEventsErrorView;

