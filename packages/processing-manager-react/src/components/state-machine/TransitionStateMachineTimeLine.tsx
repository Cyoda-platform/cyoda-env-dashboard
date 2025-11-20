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
  const activities = useMemo(() => {
    return entityVersions.map((el, index) => ({
      content: el.state || 'No state',
      timestamp: el.date || '',
      isLatest: index === 0, // First item is the latest
    }));
  }, [entityVersions]);

  return (
    <Card
      title="Time Line"
      size="small"
      className="timeline-card"
    >
      <Timeline mode="left">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <Timeline.Item
              key={index}
              color={activity.isLatest ? '#14b8a6' : 'gray'}
              dot={activity.isLatest ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined}
            >
              <div className="timeline-item-content">
                <div className="timeline-state">
                  {activity.isLatest && (
                    <Tag color="cyan" style={{ marginRight: 8 }}>Current</Tag>
                  )}
                  <strong>{activity.content}</strong>
                </div>
                <div className="timeline-timestamp">{activity.timestamp}</div>
              </div>
            </Timeline.Item>
          ))
        ) : (
          <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            No entity versions available
          </div>
        )}
      </Timeline>
    </Card>
  );
};

export default TransitionStateMachineTimeLine;

