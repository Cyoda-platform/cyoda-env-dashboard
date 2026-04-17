/**
 * InstancesCloud — cloud-mode instances list page.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.6
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Input, Space, Table, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { ModelPicker } from '../../components/cloud-workflows/ModelPicker';
import { getInstancesGateway, type EntitySummary, type ModelRef } from '../../gateways';
import { AdvancedSearchDrawer } from './AdvancedSearchDrawer';

const { Title } = Typography;
const PAGE_SIZE = 20;

export const InstancesCloud: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const entityName = searchParams.get('entityName') ?? '';
  const modelVersion = Number(searchParams.get('modelVersion'));
  const page = Number(searchParams.get('page') ?? '1');
  const modelRef: ModelRef | null = entityName && !Number.isNaN(modelVersion)
    ? { entityName, modelVersion } : null;

  const [idsRaw, setIdsRaw] = useState('');
  const [idsError, setIdsError] = useState<string | null>(null);
  const [filteredIds, setFilteredIds] = useState<string[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<EntitySummary[] | null>(null);

  const query = useQuery({
    queryKey: ['cloud-instances', 'list', modelRef, page, filteredIds],
    queryFn: () => filteredIds
      ? getInstancesGateway().list(modelRef!, { entityIds: filteredIds })
      : getInstancesGateway().list(modelRef!, { pageSize: PAGE_SIZE, pageNumber: page }),
    enabled: modelRef !== null,
  });

  const setModel = (next: { entityName: string; modelVersion: number } | null) => {
    if (next === null) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ entityName: next.entityName, modelVersion: String(next.modelVersion) }, { replace: true });
    }
  };

  const setPage = (next: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('page', String(next));
      return p;
    }, { replace: true });
  };

  const onIdSearch = () => {
    const ids = idsRaw.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length > 100) {
      setIdsError(`Too many IDs (${ids.length}). Refine to ≤100 or use Advanced Search.`);
      setFilteredIds(null);
      return;
    }
    setIdsError(null);
    setFilteredIds(ids.length > 0 ? ids : null);
  };

  const onAdvancedSearch = async (criterion: unknown) => {
    if (!modelRef) return;
    const result = await getInstancesGateway().search(modelRef, criterion);
    setSearchResults(result.items);
    setDrawerOpen(false);
  };

  const items = query.data?.items ?? [];
  const hasMore = query.data?.hasMore ?? false;
  const displayItems = searchResults ?? items;

  const columns = [
    { title: 'Entity Id', dataIndex: 'entityId' },
    { title: 'Entity', dataIndex: 'entityName' },
    { title: 'Current Workflow', dataIndex: 'currentWorkflowName' },
    { title: 'State', dataIndex: 'state' },
    { title: 'Created', dataIndex: 'creationDate' },
    { title: 'Updated', dataIndex: 'lastUpdateTime' },
    {
      title: 'Action',
      render: (_: any, row: EntitySummary) => (
        <Button size="small" onClick={() => navigate(
          `/instances/${encodeURIComponent(row.entityId)}` +
          `?entityName=${encodeURIComponent(row.entityName)}` +
          `&modelVersion=${row.modelVersion}` +
          (row.currentWorkflowName ? `&workflowName=${encodeURIComponent(row.currentWorkflowName)}` : ''),
        )}>Open</Button>
      ),
    },
  ];

  const currentValue = modelRef ? { entityName: modelRef.entityName, modelVersion: modelRef.modelVersion } : null;

  return (
    <Space direction="vertical" style={{ width: '100%', padding: 16 }} size="middle">
      <Title level={1}>Instances</Title>
      <Space wrap>
        <ModelPicker value={currentValue} onChange={setModel} />
      </Space>
      <Space>
        <Input
          placeholder="Search by id (comma-separated)"
          value={idsRaw}
          onChange={(e) => setIdsRaw(e.target.value)}
          style={{ width: 360 }}
        />
        <Button onClick={onIdSearch}>Search</Button>
        <Button onClick={() => setDrawerOpen(true)}>Advanced</Button>
      </Space>
      {idsError && <Alert type="error" message={idsError} />}
      <Table
        rowKey="entityId"
        dataSource={displayItems}
        columns={columns as any}
        pagination={false}
        loading={query.isLoading}
        size="small"
      />
      {filteredIds === null && searchResults === null && (
        <Space>
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span>Page {page}</span>
          <Button disabled={!hasMore} onClick={() => setPage(page + 1)}>Next</Button>
        </Space>
      )}
      <AdvancedSearchDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSearch={onAdvancedSearch} />
    </Space>
  );
};
