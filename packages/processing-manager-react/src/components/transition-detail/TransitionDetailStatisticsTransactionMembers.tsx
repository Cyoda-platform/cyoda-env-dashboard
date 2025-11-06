/**
 * Transition Detail Statistics Transaction Members Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/TransitionDetailStatisticsTransactionMembers.vue
 */

import React, { useState, useRef, useMemo } from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';
import MembersFilter, { MembersFilterRef } from './MembersFilter';
import MembersTable from './MembersTable';
import { Pagination } from '../common';
import { useTransactionsViewMembers } from '../../hooks';
import dayjs from 'dayjs';

export const TransitionDetailStatisticsTransactionMembers: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const membersFilterRef = useRef<MembersFilterRef>(null);
  const [paginationForm, setPaginationForm] = useState({
    pageSize: 10,
    requestLast: false,
    cursor: '',
  });

  const [data, setData] = useState<any>({
    rows: [],
    firstPage: false,
    lastPage: false,
  });

  const convertTime = (mkTime: number) => {
    return dayjs(mkTime).format('YYYY-MM-DD HH:mm:ss.SSS');
  };

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

  const { refetch, isLoading } = useTransactionsViewMembers(
    {
      id: transactionId,
      ...membersFilterRef.current?.form,
      ...paginationForm,
    },
    {
      enabled: false,
      onSuccess: (responseData: any) => {
        setData(responseData || { rows: [], firstPage: false, lastPage: false });
      },
    }
  );

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
      <Card>
        <Pagination
          onChange={handlePaginationChange}
          nextCursor={nextCursor}
          prevCursor={prevCursor}
          firstPage={data.firstPage}
          lastPage={data.lastPage}
        />
      </Card>
    </div>
  );
};

export default TransitionDetailStatisticsTransactionMembers;

