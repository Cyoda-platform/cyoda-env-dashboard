/**
 * Transition Entity State Machine Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionEntityStateMachine.vue
 */

import { Card, Typography } from 'antd';

import { useParams } from 'react-router-dom';

const { Title } = Typography;

export default function TransitionEntityStateMachine() {
  const { name } = useParams<{ name: string }>();

  return (
    
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Entity State Machine</Title>
          <p>Node: {name}</p>
          <p>Entity state machine will be displayed here.</p>
        </Card>
      </div>
    
  );
}

