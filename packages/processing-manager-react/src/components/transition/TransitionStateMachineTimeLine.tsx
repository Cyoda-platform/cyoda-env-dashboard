/**
 * Transition State Machine Timeline Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionStateMachine/TransitionStateMachineTimeLine.vue
 */

import React from 'react';
import { Card, Timeline } from 'antd';

interface TimelineEvent {
  timestamp: string;
  state: string;
  type: string;
  message?: string;
}

interface TransitionStateMachineTimeLineProps {
  events?: TimelineEvent[];
}

export const TransitionStateMachineTimeLine: React.FC<TransitionStateMachineTimeLineProps> = ({
  events = [],
}) => {
  const timelineItems = events.map((event, index) => ({
    key: index,
    children: (
      <div>
        <div><strong>{event.state}</strong> - {event.type}</div>
        <div style={{ fontSize: '12px', color: '#888' }}>{event.timestamp}</div>
        {event.message && <div style={{ marginTop: '4px' }}>{event.message}</div>}
      </div>
    ),
  }));

  return (
    <Card title="Timeline">
      <Timeline items={timelineItems} />
    </Card>
  );
};

export default TransitionStateMachineTimeLine;

