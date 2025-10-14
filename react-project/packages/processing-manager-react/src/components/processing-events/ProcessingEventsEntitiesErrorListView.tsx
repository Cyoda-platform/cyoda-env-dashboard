/**
 * Processing Events Entities Error List View
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/PmProcessingEventsEntitiesErrorListView.vue
 */

import React, { useState } from 'react';
import { Spin } from 'antd';
import { ProcessingEventsEntitiesErrorListViewFilter } from './ProcessingEventsEntitiesErrorListViewFilter';
import { ProcessingEventsEntitiesErrorListViewTable } from './ProcessingEventsEntitiesErrorListViewTable';
import { useProcessingQueueEntitiesErrorList } from '../../hooks';

export const ProcessingEventsEntitiesErrorListView: React.FC = () => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<any>(null);

  const { refetch } = useProcessingQueueEntitiesErrorList(
    { type: filter?.type },
    { enabled: false }
  );

  const handleChange = async (newFilter: any) => {
    setFilter(newFilter);
    setIsLoading(true);
    try {
      const { data } = await refetch();
      setTableData(data?.data?.elements || []);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Spin spinning={isLoading}>
      <div>
        <ProcessingEventsEntitiesErrorListViewFilter
          onChange={handleChange}
          isLoading={isLoading}
        />
        <ProcessingEventsEntitiesErrorListViewTable tableData={tableData} />
      </div>
    </Spin>
  );
};

export default ProcessingEventsEntitiesErrorListView;

