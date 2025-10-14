/**
 * Event View Page
 * Migrated from @cyoda/processing-manager/src/views/EventView.vue
 */

import { Card, Typography } from 'antd';
import { Layout } from '../components/layout';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export default function EventView() {
  const { name } = useParams<{ name: string }>();

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Event View</Title>
          <p>Node: {name}</p>
          <p>Processing events will be displayed here.</p>
        </Card>
      </div>
    </Layout>
  );
}

