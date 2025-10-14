/**
 * Nodes Detail Page
 * Migrated from @cyoda/processing-manager/src/views/NodesDetail.vue
 */

import { Card, Typography } from 'antd';
import { BaseLayout } from '@cyoda/ui-lib-react';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export default function NodesDetail() {
  const { name } = useParams<{ name: string }>();

  return (
    <BaseLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Node Detail: {name}</Title>
          <p>Node details will be displayed here.</p>
        </Card>
      </div>
    </BaseLayout>
  );
}

