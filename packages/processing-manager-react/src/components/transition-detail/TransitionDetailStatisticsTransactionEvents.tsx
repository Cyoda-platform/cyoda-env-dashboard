/**
 * Transition Detail Statistics Transaction Events Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/TransitionDetailStatisticsTransactionEvents.vue
 */

import React, { useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import EventsFilter, { EventsFilterRef } from './EventsFilter';
import EventsTable from './EventsTable';
import { Pagination } from '../common';
import { useTransactionsViewEvents } from '../../hooks';
import './TransitionDetailStatisticsTransactionEvents.scss';

interface TransitionDetailStatisticsTransactionEventsProps {
  transactionIdProp?: string;
}

export const TransitionDetailStatisticsTransactionEvents: React.FC<TransitionDetailStatisticsTransactionEventsProps> = ({ transactionIdProp }) => {
  const { transactionId: transactionIdFromParams } = useParams<{ transactionId: string }>();
  const transactionId = transactionIdProp || transactionIdFromParams;
  const eventsFilterRef = useRef<EventsFilterRef>(null);
  const [paginationForm, setPaginationForm] = useState({
    pageSize: 10,
    requestLast: false,
    cursor: '',
  });

  const { data: queryData, refetch, isLoading } = useTransactionsViewEvents(
    {
      id: transactionId,
      ...eventsFilterRef.current?.form,
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
      return data.rows[0].timeUUID;
    }
    return '';
  }, [data.rows]);

  const nextCursor = useMemo(() => {
    if (data.rows.length > 0) {
      return data.rows[data.rows.length - 1].timeUUID;
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
    <div className="transaction-events">
      <EventsFilter ref={eventsFilterRef} isLoading={isLoading} onChange={handleFilterChange} />
      <EventsTable tableData={data.rows} isLoading={isLoading} />
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

export default TransitionDetailStatisticsTransactionEvents;

