/**
 * Entity Versions Modal Component
 * Displays entity versions in a modal window
 */

import React, { useState } from 'react';
import { Modal, Alert, Spin, Card } from 'antd';
import { useEntityVersions } from '../../hooks';
import { TransitionVersionsFilter, TransitionVersionsAggregated, TransitionVersionsSorted } from '../versions';
import { Pagination } from '../common/Pagination';
import './EntityVersionsModal.scss';

interface EntityVersionsModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: string;
}

export const EntityVersionsModal: React.FC<EntityVersionsModalProps> = ({
  visible,
  onClose,
  entityId,
  entityType,
}) => {
  const [filterParams, setFilterParams] = useState<any>({});
  const [paginationParams, setPaginationParams] = useState<any>({});

  const { data, isLoading, error } = useEntityVersions({
    type: entityType,
    id: entityId,
    ...filterParams,
    ...paginationParams,
  });

  // Extract entity class name from full type path
  const entityClassName = entityType ? entityType.split('.').pop() || entityType : '';

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

  return (
    <Modal
      title={`Version columns of entity (${entityClassName}): ${entityId}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="entity-versions-modal"
    >
      <div className="entity-versions-content">
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
    </Modal>
  );
};

export default EntityVersionsModal;

