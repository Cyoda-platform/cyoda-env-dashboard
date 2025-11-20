/**
 * Transactions Entities Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities.vue
 */

import React, { useState } from 'react';
import TransactionsEntitiesFilter from './TransactionsEntitiesFilter';
import TransactionsEntitiesTable from './TransactionsEntitiesTable';
import { axiosProcessing } from '@cyoda/http-api-react';
import { HelperUrl } from '../../utils';

export const TransactionsEntities: React.FC = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (values: any) => {
    try {
      setIsLoading(true);
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/entities-list'),
        { params: values }
      );
      setTableData(data?.entities || []);
    } catch (error) {
      console.error('Failed to load transactions entities:', error);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TransactionsEntitiesFilter isLoading={isLoading} onChange={handleFilterChange} />
      <TransactionsEntitiesTable tableData={tableData} isLoading={isLoading} />
    </div>
  );
};

export default TransactionsEntities;

