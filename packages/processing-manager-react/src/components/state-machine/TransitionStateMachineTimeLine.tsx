/**
 * Transition State Machine Timeline Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineTimeLine.vue
 */

import React, { useMemo } from 'react';
import { Card, Timeline } from 'antd';

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
    return entityVersions.map((el) => ({
      content: el.state || 'No state',
      timestamp: el.date || '',
    }));
  }, [entityVersions]);

  return (
    <Card title="Time Line">
      <Timeline>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <Timeline.Item key={index} label={activity.timestamp}>
              {activity.content}
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

