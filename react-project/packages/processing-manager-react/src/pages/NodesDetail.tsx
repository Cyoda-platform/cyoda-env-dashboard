/**
 * Nodes Detail Page
 * Migrated from @cyoda/processing-manager/src/views/NodesDetail.vue
 *
 * Improvements:
 * - Lazy loading for tabs (only active tab renders)
 * - Tab state persistence using localStorage
 */

import React, { useState, useEffect } from 'react';
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

const TAB_STORAGE_KEY = 'nodesDetailTab';

export default function NodesDetail() {
  const { name } = useParams<{ name: string }>();

  // Load initial tab from localStorage, default to '1'
  const [activeKey, setActiveKey] = useState<string>(() => {
    try {
      return localStorage.getItem(TAB_STORAGE_KEY) || '1';
    } catch (error) {
      console.warn('Failed to load tab state from localStorage:', error);
      return '1';
    }
  });

  // Save tab state to localStorage when it changes
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, key);
    } catch (error) {
      console.warn('Failed to save tab state to localStorage:', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Title level={2}>Node Detail: {name}</Title>
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            <TabPane tab="Processing Manager" key="1">
              {activeKey === '1' && <ShardsDetailTabProcessingManager />}
            </TabPane>
            <TabPane tab="Server Summary" key="2">
              {activeKey === '2' && <ShardsDetailTabSummary />}
            </TabPane>
            <TabPane tab="Cassandra" key="3">
              {activeKey === '3' && <ShardsDetailTabCassandra />}
            </TabPane>
            <TabPane tab="Processing Events" key="4">
              {activeKey === '4' && <ShardsDetailTabProcessingEvents />}
            </TabPane>
            <TabPane tab="Time Statistics" key="5">
              {activeKey === '5' && <ShardsDetailTabTimeStatistics />}
            </TabPane>
            <TabPane tab="Transactions" key="6">
              {activeKey === '6' && <ShardsDetailTabTransactions />}
            </TabPane>
            <TabPane tab="PM components" key="7">
              {activeKey === '7' && <ShardsDetailTabPmComponents />}
            </TabPane>
            <TabPane tab="Composite indexes" key="8">
              {activeKey === '8' && <ShardsDetailTabCompositeIndexes />}
            </TabPane>
            <TabPane tab="Caches List" key="9">
              {activeKey === '9' && <ShardsDetailTabCachesList />}
            </TabPane>
            <TabPane tab="Network info" key="10">
              {activeKey === '10' && <ShardsDetailTabNetworkInfo />}
            </TabPane>
            <TabPane tab="ZooKeeper info" key="11">
              {activeKey === '11' && <ShardsDetailTabZKInfo />}
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}

