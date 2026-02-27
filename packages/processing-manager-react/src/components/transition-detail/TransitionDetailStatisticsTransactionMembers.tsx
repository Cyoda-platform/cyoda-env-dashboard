/**
 * Transition Detail Statistics Transaction Members Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/TransitionDetailStatisticsTransactionMembers.vue
 */

import React, { useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MembersFilter, { MembersFilterRef } from './MembersFilter';
import MembersTable from './MembersTable';
import { Pagination } from '../common';
import { useTransactionsViewMembers } from '../../hooks';
import dayjs from 'dayjs';
import './TransitionDetailStatisticsTransactionMembers.scss';

interface TransitionDetailStatisticsTransactionMembersProps {
  transactionIdProp?: string;
}

export const TransitionDetailStatisticsTransactionMembers: React.FC<TransitionDetailStatisticsTransactionMembersProps> = ({ transactionIdProp }) => {
  const { transactionId: transactionIdFromParams } = useParams<{ transactionId: string }>();
  const transactionId = transactionIdProp || transactionIdFromParams;
  const membersFilterRef = useRef<MembersFilterRef>(null);
  const [paginationForm, setPaginationForm] = useState({
    pageSize: 10,
    requestLast: false,
    cursor: '',
  });

  const convertTime = (mkTime: number) => {
    return dayjs(mkTime).format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  const { data: queryData, refetch, isLoading } = useTransactionsViewMembers(
    {
      id: transactionId,
      ...membersFilterRef.current?.form,
      ...paginationForm,
    },
    {
      enabled: false,
    }
  );

  const data = useMemo(() => {
    if (!queryData) return { rows: [] as any[], firstPage: false, lastPage: false };
    return queryData as { rows: any[]; firstPage: boolean; lastPage: boolean };
  }, [queryData]);

  const prevCursor = useMemo(() => {
    if (data.rows.length > 0) {
      return convertTime(data.rows[0].versionCheckTimeMillis);
    }
    return '';
  }, [data.rows]);

  const nextCursor = useMemo(() => {
    if (data.rows.length > 0) {
      return convertTime(data.rows[data.rows.length - 1].versionCheckTimeMillis);
    }
    return '';
  }, [data.rows]);

  const handleFilterChange = async () => {
    await refetch();
  };

  const handlePaginationChange = async (newPaginationForm: any) => {
    setPaginationForm(newPaginationForm);
    await refetch();
  };

  return (
    <div className="transaction-detail">
      <MembersFilter ref={membersFilterRef} isLoading={isLoading} onChange={handleFilterChange} />
      <MembersTable tableData={data.rows} isLoading={isLoading} />
      <div className="pagination-wrapper">
        <Pagination
          onChange={handlePaginationChange}
          nextCursor={nextCursor}
          prevCursor={prevCursor}
          firstPage={data.firstPage}
          lastPage={data.lastPage}
        />
      </div>
    </div>
  );
};

export default TransitionDetailStatisticsTransactionMembers;

