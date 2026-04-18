/**
 * Transactions View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView.vue
 */

import React, { useState, useMemo } from 'react';
import { TransactionsViewFilter } from './TransactionsViewFilter';
import { TransactionsViewTable } from './TransactionsViewTable';
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

  const handlePageSizeChange = (size: number) => {
    setPaginationForm((prev) => ({
      ...prev,
      pageSize: size,
    }));
  };

  const handleFirst = () => {
    setPaginationForm((prev) => ({
      ...prev,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    }));
  };

  const handlePrev = () => {
    setPaginationForm((prev) => ({
      ...prev,
      prevCursor,
      nextCursor: null,
      requestLast: false,
    }));
  };

  const handleNext = () => {
    setPaginationForm((prev) => ({
      ...prev,
      nextCursor,
      prevCursor: null,
      requestLast: false,
    }));
  };

  const handleLast = () => {
    setPaginationForm((prev) => ({
      ...prev,
      requestLast: true,
      nextCursor: null,
      prevCursor: null,
    }));
  };

  return (
    <div>
      <TransactionsViewFilter isLoading={isLoading} onChange={handleFilterChange} />
      <TransactionsViewTable
        isLoading={isLoading}
        tableData={tableData}
        pageSize={paginationForm.pageSize}
        firstPage={firstPage}
        lastPage={lastPage}
        onPageSizeChange={handlePageSizeChange}
        onFirst={handleFirst}
        onPrev={handlePrev}
        onNext={handleNext}
        onLast={handleLast}
      />
    </div>
  );
};

export default TransactionsView;

