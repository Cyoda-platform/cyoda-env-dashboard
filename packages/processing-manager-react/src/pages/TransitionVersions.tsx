/**
 * Transition Versions Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionVersions.vue
 */

import { useState, useMemo } from 'react';
import { Typography, Breadcrumb, Spin, Alert, Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEntityVersions } from '../hooks';
import { TransitionVersionsFilter, TransitionVersionsAggregated, TransitionVersionsSorted } from '../components/versions';
import { Pagination } from '../components/common/Pagination';

const { Title } = Typography;

export default function TransitionVersions() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get query parameters from URL
  const entityId = searchParams.get('entityId') || '';
  const entityType = searchParams.get('type') || '';

  const [filterParams, setFilterParams] = useState<any>({});
  const [paginationParams, setPaginationParams] = useState<any>({});

  const { data, isLoading, error } = useEntityVersions({
    type: entityType,
    id: entityId,
    ...filterParams,
    ...paginationParams,
  });

  // Extract entity class name from full type path
  const entityClassName = useMemo(() => {
    if (entityType) {
      return entityType.split('.').pop() || entityType;
    }
    return '';
  }, [entityType]);

  const rows = data?.rows || [];
  const firstPage = data?.firstPage || false;
  const lastPage = data?.lastPage || false;

  const prevCursor = rows.length > 0 ? rows[0].transactionId : '';
  const nextCursor = rows.length > 0 ? rows[rows.length - 1].transactionId : '';

  const handleFilterChange = (values: any) => {
    setFilterParams(values);
    // Reset pagination when filter changes
    setPaginationParams({});
  };

  const handlePaginationChange = (form: any) => {
    setPaginationParams({
      pageSize: form.pageSize,
      requestLast: form.requestLast,
      nextCursor: form.nextCursor,
      prevCursor: form.prevCursor,
    });
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
      title: 'Entity Versions',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb
        items={breadcrumbItems}
        style={{ marginBottom: 16 }}
      />

      <Title level={3} style={{ marginBottom: 24 }}>
        Version columns of entity ({entityClassName}): {entityId}
      </Title>

      <TransitionVersionsFilter
        isLoading={isLoading}
        onChange={handleFilterChange}
      />

      {error && (
        <Alert
          message="Error"
          description="Failed to load entity versions"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <TransitionVersionsAggregated rows={rows} />
          <TransitionVersionsSorted rows={rows} />
          <Card variant="borderless">
            <Pagination
              firstPage={firstPage}
              lastPage={lastPage}
              nextCursor={nextCursor}
              prevCursor={prevCursor}
              onChange={handlePaginationChange}
            />
          </Card>
        </>
      )}
    </div>
  );
}

