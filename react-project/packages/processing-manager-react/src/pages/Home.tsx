/**
 * Home Page
 * Migrated from @cyoda/processing-manager/src/views/Home.vue
 */

import { Card, Typography } from 'antd';
import { BaseLayout } from '@cyoda/ui-lib-react';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <BaseLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Processing Manager</Title>
          <Paragraph>
            Welcome to the Processing Manager. This application allows you to monitor and manage
            data processing operations, nodes, transactions, and more.
          </Paragraph>
          <Paragraph>
            Use the navigation menu to access different sections:
          </Paragraph>
          <ul>
            <li>Nodes - View and manage processing nodes</li>
            <li>Transactions - Monitor transaction processing</li>
            <li>Events - View processing events and statistics</li>
            <li>Monitoring - Real-time monitoring and metrics</li>
          </ul>
        </Card>
      </div>
    </BaseLayout>
  );
}

