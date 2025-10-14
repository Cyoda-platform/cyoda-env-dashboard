/**
 * Transactions View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView.vue
 */

import React, { useState, useMemo } from 'react';
import { TransactionsViewFilter } from './TransactionsViewFilter';
import { TransactionsViewTable } from './TransactionsViewTable';
import { Pagination } from '../common';
import { useTransactions } from '../../hooks';

interface PaginationForm {
  pageSize: number;
  requestLast: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

export const TransactionsView: React.FC = () => {
  const [filterValues, setFilterValues] = useState<any>({});
  const [paginationForm, setPaginationForm] = useState<PaginationForm>({
    pageSize: 25,
    requestLast: false,
    nextCursor: null,
    prevCursor: null,
  });

  const queryParams = useMemo(
    () => ({
      ...filterValues,
      ...paginationForm,
    }),
    [filterValues, paginationForm]
  );

  const { data, isLoading } = useTransactions(queryParams);

  const tableData = data?.rows || [];
  const firstPage = data?.firstPage || false;
  const lastPage = data?.lastPage || false;

  const prevCursor = tableData.length > 0 ? tableData[0].createTime : '';
  const nextCursor = tableData.length > 0 ? tableData[tableData.length - 1].createTime : '';

  const handleFilterChange = (values: any) => {
    setFilterValues(values);
    // Reset pagination when filter changes
    setPaginationForm({
      pageSize: paginationForm.pageSize,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    });
  };

  const handlePaginationChange = (form: PaginationForm) => {
    setPaginationForm(form);
  };

  return (
    <div>
      <TransactionsViewFilter isLoading={isLoading} onChange={handleFilterChange} />
      <TransactionsViewTable isLoading={isLoading} tableData={tableData} />
      <Pagination
        nextCursor={nextCursor}
        prevCursor={prevCursor}
        firstPage={firstPage}
        lastPage={lastPage}
        onChange={handlePaginationChange}
      />
    </div>
  );
};

export default TransactionsView;

