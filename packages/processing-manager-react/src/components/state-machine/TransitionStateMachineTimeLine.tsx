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
      content: el.state,
      timestamp: el.date,
    }));
  }, [entityVersions]);

  return (
    <Card title="Time Line">
      <Timeline>
        {activities.map((activity, index) => (
          <Timeline.Item key={index} label={activity.timestamp}>
            {activity.content}
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

export default TransitionStateMachineTimeLine;

