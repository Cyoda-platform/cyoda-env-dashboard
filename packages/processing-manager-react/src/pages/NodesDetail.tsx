/**
 * Nodes Detail Page
 * Migrated from @cyoda/processing-manager/src/views/NodesDetail.vue
 * Redesigned to integrate with saas-app layout
 *
 * Improvements:
 * - Lazy loading for tabs (only active tab renders)
 * - Tab state persistence using localStorage
 */

import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useProcessingStore } from '../stores/processingStore';
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
import './NodesDetail.scss';

const TAB_STORAGE_KEY = 'nodesDetailTab';

export default function NodesDetail() {
  const { name } = useParams<{ name: string }>();
  const setNode = useAppStore((state) => state.setNode);
  const setSelectedNode = useProcessingStore((state) => state.setSelectedNode);

  // Set the node in appStore and processingStore when component mounts or name changes
  useEffect(() => {
    if (name) {
      setNode(name);
      // Set selectedNode in processingStore for hooks that depend on it (e.g., useSiftLogger)
      setSelectedNode(name as any); // Type assertion needed as selectedNode expects PmNode
      console.log('🔧 Set node in appStore and processingStore:', name);
    }
  }, [name, setNode, setSelectedNode]);

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

  const tabItems = [
    {
      key: '1',
      label: 'Processing Manager',
      children: activeKey === '1' ? <ShardsDetailTabProcessingManager /> : null,
    },
    {
      key: '2',
      label: 'Server Summary',
      children: activeKey === '2' ? <ShardsDetailTabSummary /> : null,
    },
    {
      key: '3',
      label: 'Cassandra',
      children: activeKey === '3' ? <ShardsDetailTabCassandra /> : null,
    },
    {
      key: '4',
      label: 'Processing Events',
      children: activeKey === '4' ? <ShardsDetailTabProcessingEvents /> : null,
    },
    {
      key: '5',
      label: 'Time Statistics',
      children: activeKey === '5' ? <ShardsDetailTabTimeStatistics /> : null,
    },
    {
      key: '6',
      label: 'Transactions',
      children: activeKey === '6' ? <ShardsDetailTabTransactions /> : null,
    },
    {
      key: '7',
      label: 'PM components',
      children: activeKey === '7' ? <ShardsDetailTabPmComponents /> : null,
    },
    {
      key: '8',
      label: 'Composite indexes',
      children: activeKey === '8' ? <ShardsDetailTabCompositeIndexes /> : null,
    },
    {
      key: '9',
      label: 'Caches List',
      children: activeKey === '9' ? <ShardsDetailTabCachesList /> : null,
    },
    {
      key: '10',
      label: 'Network info',
      children: activeKey === '10' ? <ShardsDetailTabNetworkInfo /> : null,
    },
    {
      key: '11',
      label: 'ZooKeeper info',
      children: activeKey === '11' ? <ShardsDetailTabZKInfo /> : null,
    },
  ];

  return (
    <div className="nodes-detail">
      <Tabs activeKey={activeKey} onChange={handleTabChange} items={tabItems} />
    </div>
  );
}

