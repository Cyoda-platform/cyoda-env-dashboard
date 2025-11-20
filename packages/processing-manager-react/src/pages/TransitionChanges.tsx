/**
 * Transition Changes Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionChanges.vue
 */

import { useMemo } from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TransitionChangesTable } from '@cyoda/ui-lib-react';

const { Title } = Typography;

export default function TransitionChanges() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get query parameters from URL
  const entityId = searchParams.get('entityId') || '';
  const entityType = searchParams.get('type') || '';

  // Extract entity class name from full type path
  const entityClassName = useMemo(() => {
    if (entityType) {
      return entityType.split('.').pop() || entityType;
    }
    return '';
  }, [entityType]);

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
      title: 'Entity Changes',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb
        items={breadcrumbItems}
        style={{ marginBottom: 16 }}
      />

      <Title level={3} style={{ marginBottom: 24 }}>
        Changes of entity ({entityClassName}): {entityId}
      </Title>

      <TransitionChangesTable
        type={entityType}
        entityId={entityId}
        nodeName={name}
        disableLink={false}
      />
    </div>
  );
}

