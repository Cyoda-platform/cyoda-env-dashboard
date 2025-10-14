/**
 * Nodes Detail Page
 * Migrated from @cyoda/processing-manager/src/views/NodesDetail.vue
 */

import React, { useState } from 'react';
import { Card, Typography, Tabs } from 'antd';
import { Layout } from '../components/layout';
import { useParams } from 'react-router-dom';
import {
  ShardsDetailTabProcessingManager,
  ShardsDetailTabSummary,
  ShardsDetailTabCassandra,
  ShardsDetailTabProcessingEvents,
  ShardsDetailTabTimeStatistics,
  ShardsDetailTabTransactions,
  ShardsDetailTabPmComponents,
  ShardsDetailTabCompositeIndexes,
  ShardsDetailTabCachesList,
  ShardsDetailTabNetworkInfo,
  ShardsDetailTabZKInfo,
} from '../components/shards';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function NodesDetail() {
  const { name } = useParams<{ name: string }>();
  const [activeKey, setActiveKey] = useState('1');

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Node Detail: {name}</Title>
          <Tabs activeKey={activeKey} onChange={setActiveKey}>
            <TabPane tab="Processing Manager" key="1">
              <ShardsDetailTabProcessingManager />
            </TabPane>
            <TabPane tab="Server Summary" key="2">
              <ShardsDetailTabSummary />
            </TabPane>
            <TabPane tab="Cassandra" key="3">
              <ShardsDetailTabCassandra />
            </TabPane>
            <TabPane tab="Processing Events" key="4">
              <ShardsDetailTabProcessingEvents />
            </TabPane>
            <TabPane tab="Time Statistics" key="5">
              <ShardsDetailTabTimeStatistics />
            </TabPane>
            <TabPane tab="Transactions" key="6">
              <ShardsDetailTabTransactions />
            </TabPane>
            <TabPane tab="PM components" key="7">
              <ShardsDetailTabPmComponents />
            </TabPane>
            <TabPane tab="Composite indexes" key="8">
              <ShardsDetailTabCompositeIndexes />
            </TabPane>
            <TabPane tab="Caches List" key="9">
              <ShardsDetailTabCachesList />
            </TabPane>
            <TabPane tab="Network info" key="10">
              <ShardsDetailTabNetworkInfo />
            </TabPane>
            <TabPane tab="ZooKeeper info" key="11">
              <ShardsDetailTabZKInfo />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}

