/**
 * Transition Entity State Machine Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionEntityStateMachine.vue
 */

import { useState } from 'react';
import { Row, Col, Spin, Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEntityStateMachine } from '../hooks';
import {
  TransitionStateMachineForm,
  TransitionStateMachineTable,
  TransitionStateMachineTimeLine,
} from '../components/state-machine';

const { Title } = Typography;

export default function TransitionEntityStateMachine() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const entityType = searchParams.get('type') || '';
  const entityId = searchParams.get('entityId') || '';

  const { data, refetch } = useEntityStateMachine({
    type: entityType,
    id: entityId,
  });

  const entityVersions = data?.entityVersions || [];
  const possibleTransitions = data?.possibleTransitions || [];
  const stateMachineEvents = data?.stateMachineEvents || [];

  const title = entityType
    ? `State machine view for entity (${entityType.split('.').pop()}): ${entityId}`
    : 'Entity State Machine';

  const handleUpdated = async () => {
    setIsLoading(true);
    await refetch();
    setIsLoading(false);
  };

  const breadcrumbItems = [
    {
      title: (
        <span>
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>Processing</span>
        </span>
      ),
      onClick: () => navigate('/processing-ui'),
    },
    {
      title: 'Nodes',
      onClick: () => navigate('/processing-ui/nodes'),
    },
    {
      title: name,
      onClick: () => navigate(`/processing-ui/nodes/${name}`),
    },
    {
      title: 'Entity State Machine',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />

      <Spin spinning={isLoading}>
        <Row gutter={24}>
          <Col xs={24} sm={18}>
            <Title level={2}>{title}</Title>
            <TransitionStateMachineForm
              possibleTransitions={possibleTransitions}
              onUpdated={handleUpdated}
            />
            <div style={{ marginTop: 16 }}>
              <TransitionStateMachineTable stateMachineEvents={stateMachineEvents} />
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <TransitionStateMachineTimeLine entityVersions={entityVersions} />
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

