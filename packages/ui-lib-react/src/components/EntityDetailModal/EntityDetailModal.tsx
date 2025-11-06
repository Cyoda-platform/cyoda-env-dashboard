/**
 * EntityDetailModal Component
 * Shows entity details in a modal with tabs (Details, Data lineage, Audit)
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity.vue
 */

import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Descriptions, Spin, Button, Switch } from 'antd';
import axios from 'axios';
import type { ConfigDefinition } from './types';
import EntityDataLineage from './EntityDataLineage';
import EntityAudit from './EntityAudit';
import './EntityDetailModal.scss';

interface EntityDetailModalProps {
  visible: boolean;
  selectedRow: any;
  configDefinition: ConfigDefinition;
  onClose: () => void;
}

const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  visible,
  selectedRow,
  configDefinition,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<any>(null);
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  // Extract entity ID from the row
  const getEntityId = () => {
    return selectedRow?.id || selectedRow?.content_id || null;
  };

  // Get short entity class name
  const getShortEntityName = () => {
    if (!configDefinition.entityClass) return '';
    const parts = configDefinition.entityClass.split('.');
    return parts[parts.length - 1];
  };

  // Load entity data
  useEffect(() => {
    const loadEntity = async () => {
      const entityId = getEntityId();
      if (!visible || !entityId || !configDefinition.entityClass) return;

      setLoading(true);
      try {
        const { data } = await axios.get(
          `/platform-api/entity/${configDefinition.entityClass}/${entityId}`
        );
        setEntity(data);
      } catch (error) {
        console.error('Failed to load entity:', error);
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [visible, selectedRow, configDefinition.entityClass]);

  // Reset tab when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab('details');
    }
  }, [visible]);

  // Get standard fields
  const getStandardFields = () => {
    if (!entity) return {};
    
    return {
      id: entity.id || getEntityId(),
      state: entity.state || 'VALIDATED',
      previousTransition: entity.previousTransition || '-',
      createdDate: entity.creationDate || entity.createdDate || '-',
      lastUpdatedDate: entity.lastUpdateTime || entity.modificationDate || '-',
    };
  };

  // Filter entity fields (remove standard fields)
  const getEntityFields = () => {
    if (!entity) return {};
    
    const standardKeys = ['id', 'state', 'previousTransition', 'creationDate', 'createdDate', 'lastUpdateTime', 'modificationDate'];
    const filtered: any = {};
    
    Object.entries(entity).forEach(([key, value]) => {
      if (!standardKeys.includes(key)) {
        // Only show non-empty fields if showEmptyFields is false
        if (showEmptyFields || (value !== null && value !== undefined && value !== '')) {
          filtered[key] = value;
        }
      }
    });
    
    return filtered;
  };

  const standardFields = getStandardFields();
  const entityFields = getEntityFields();

  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="entity-detail-tab">
          <div className="entity-detail-section">
            <h4>Standard fields</h4>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Id">{standardFields.id}</Descriptions.Item>
              <Descriptions.Item label="State">{standardFields.state}</Descriptions.Item>
              <Descriptions.Item label="Previous Transition">{standardFields.previousTransition}</Descriptions.Item>
              <Descriptions.Item label="Created Date">{standardFields.createdDate}</Descriptions.Item>
              <Descriptions.Item label="Last updated date">{standardFields.lastUpdatedDate}</Descriptions.Item>
            </Descriptions>
          </div>

          <div className="entity-detail-section">
            <div className="entity-header">
              <h4>Entity</h4>
              <div className="entity-controls">
                <span style={{ marginRight: 8 }}>Show Empty Fields</span>
                <Switch 
                  checked={showEmptyFields} 
                  onChange={setShowEmptyFields}
                />
              </div>
            </div>
            <Descriptions bordered column={1} size="small">
              {Object.entries(entityFields).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {typeof value === 'object' ? (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    String(value)
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        </div>
      ),
    },
    {
      key: 'dataLineage',
      label: 'Data lineage',
      children: (
        <div className="entity-detail-tab">
          {visible && getEntityId() && configDefinition.entityClass && (
            <EntityDataLineage
              entityClass={configDefinition.entityClass}
              entityId={getEntityId()!}
            />
          )}
        </div>
      ),
    },
    {
      key: 'audit',
      label: 'Audit',
      children: (
        <div className="entity-detail-tab">
          {visible && getEntityId() && configDefinition.entityClass && (
            <EntityAudit
              entityClass={configDefinition.entityClass}
              entityId={getEntityId()!}
            />
          )}
        </div>
      ),
    },
  ];

  const title = `Entity ${getShortEntityName()} (${getEntityId()})`;

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width="90%"
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Spin>
    </Modal>
  );
};

export default EntityDetailModal;

