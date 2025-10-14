/**
 * Transition Detail Statistics Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/TransitionDetailStatistics.vue
 */

import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';
import { useTransactionsView } from '../../hooks';
import dayjs from 'dayjs';
import './TransitionDetailStatistics.scss';

const formatDateTime = (value: number | null | undefined) => {
  if (!value) return '';
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
};

const formatCountdown = (value: number | null | undefined) => {
  if (!value) return '';
  const seconds = Math.floor(value / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
};

const formatBoolean = (value: boolean | null | undefined) => {
  return value ? 'Yes' : 'No';
};

export const TransitionDetailStatistics: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transactionInfoView, setTransactionInfoView] = useState<any>({});
  const [shardUUID, setShardUUID] = useState<string>('');
  const [parentTransactionIds, setParentTransactionIds] = useState<string[]>([]);

  const { data, isLoading } = useTransactionsView({ id: transactionId });

  useEffect(() => {
    if (data) {
      setTransactionInfoView(data.transactionInfoView || {});
      setShardUUID(data.shardUUID || '');
      setParentTransactionIds(data.parentTransactionIds || []);
    }
  }, [data]);

  return (
    <Card title="Statistics" loading={isLoading} className="transition-detail-statistics">
      <ul>
        <li className="name">Transaction ID</li>
        <li>{transactionInfoView.id}</li>
        <li className="name">Transaction Status</li>
        <li>{transactionInfoView.status}</li>
        <li className="name">Transaction Submit Node Id</li>
        <li>{transactionInfoView.transactionSubmitNodeId}</li>
        <li className="name">User</li>
        <li>{transactionInfoView.owner}</li>
        <li className="name">Shard(uuid)</li>
        <li>{shardUUID}</li>
        <li className="name">Consistency Time</li>
        <li>{formatDateTime(transactionInfoView.transactionConsistencyTime)}</li>
        <li className="name">Create time</li>
        <li>{formatDateTime(transactionInfoView.createTime)}</li>
        <li className="name">Submit time</li>
        <li>{formatDateTime(transactionInfoView.submitTime)}</li>
        <li className="name">Finish time</li>
        <li>{formatDateTime(transactionInfoView.finishTime)}</li>
        <li className="name">Prepare duration</li>
        <li>{formatCountdown(transactionInfoView.prepareTimeMillis)}</li>
        <li className="name">Process duration</li>
        <li>{formatCountdown(transactionInfoView.processTimeMillis)}</li>
        <li className="name">Second Phase Finished Flag</li>
        <li>{formatBoolean(transactionInfoView.secondPhaseFinished)}</li>
        <li className="name">Transaction Succeeded Flag</li>
        <li>{formatBoolean(transactionInfoView.transactionSucceeded)}</li>
        <li className="name">Parent Transactions</li>
        <li>
          {parentTransactionIds.map((parentTransactionId, index) => (
            <React.Fragment key={index}>
              {index + 1}) {parentTransactionId}
              <br />
            </React.Fragment>
          ))}
        </li>
      </ul>
    </Card>
  );
};

export default TransitionDetailStatistics;

