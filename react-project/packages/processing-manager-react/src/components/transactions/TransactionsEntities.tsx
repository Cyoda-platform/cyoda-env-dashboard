/**
 * Transactions Entities Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities.vue
 */

import React, { useState } from 'react';
import TransactionsEntitiesFilter from './TransactionsEntitiesFilter';
import TransactionsEntitiesTable from './TransactionsEntitiesTable';
import { useTransactionsEntitiesList } from '../../hooks';

export const TransactionsEntities: React.FC = () => {
  const [filterValues, setFilterValues] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);

  const { refetch, isLoading } = useTransactionsEntitiesList(filterValues, {
    enabled: false,
    onSuccess: (data: any) => {
      setTableData(data?.entities || []);
    },
  });

  const handleFilterChange = async (values: any) => {
    setFilterValues(values);
    await refetch();
  };

  return (
    <div>
      <TransactionsEntitiesFilter isLoading={isLoading} onChange={handleFilterChange} />
      <TransactionsEntitiesTable tableData={tableData} isLoading={isLoading} />
    </div>
  );
};

export default TransactionsEntities;

