/**
 * Transition State Machine Timeline Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineTimeLine.vue
 */

import React, { useMemo } from 'react';
import { Card, Timeline, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import './TransitionStateMachineTimeLine.scss';

interface EntityVersion {
  state: string;
  date: string;
}

interface TransitionStateMachineTimeLineProps {
  entityVersions: EntityVersion[];
}

export const TransitionStateMachineTimeLine: React.FC<TransitionStateMachineTimeLineProps> = ({
  entityVersions = [],
}) => {
  const timelineItems = useMemo(() => {
    if (entityVersions.length === 0) {
      return [];
    }

    return entityVersions.map((el, index) => {
      const isLatest = index === 0;
      return {
        color: isLatest ? '#14b8a6' : 'gray',
        dot: isLatest ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined,
        children: (
          <div className="timeline-item-content">
            <div className="timeline-state">
              {isLatest && (
                <Tag color="cyan" style={{ marginRight: 8 }}>Current</Tag>
              )}
              <strong>{el.state || 'No state'}</strong>
            </div>
            <div className="timeline-timestamp">{el.date || ''}</div>
          </div>
        ),
      };
    });
  }, [entityVersions]);

  return (
    <Card
      title="Time Line"
      size="small"
      className="timeline-card"
    >
      {timelineItems.length > 0 ? (
        <Timeline mode="left" items={timelineItems} />
      ) : (
        <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          No entity versions available
        </div>
      )}
    </Card>
  );
};

export default TransitionStateMachineTimeLine;

