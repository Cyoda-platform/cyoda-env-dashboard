/**
 * Event View Page
 * Migrated from @cyoda/processing-manager/src/views/EventView.vue
 */

import { Card, Typography } from 'antd';
import { BaseLayout } from '@cyoda/ui-lib-react';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export default function EventView() {
  const { name } = useParams<{ name: string }>();

  return (
    <BaseLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Event View</Title>
          <p>Node: {name}</p>
          <p>Processing events will be displayed here.</p>
        </Card>
      </div>
    </BaseLayout>
  );
}

