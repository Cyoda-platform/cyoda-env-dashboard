/**
 * EntityDetailModal Component
 * Shows entity details in a modal with tabs (Details, Data lineage, Audit)
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity.vue
 */

import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Spin, Button, Switch, Divider } from 'antd';
import { getEntityLoad } from '@cyoda/http-api-react';
import type { Entity } from '@cyoda/http-api-react';
import type { ConfigDefinition } from './types';
import EntityDataLineage from './EntityDataLineage';
import EntityAudit from './EntityAudit';
import EntityTransitions from './EntityTransitions';
import EntityDetailTree from './EntityDetailTree';
import HelperDetailEntity from '../../utils/HelperDetailEntity';
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
  const [entity, setEntity] = useState<Entity[]>([]);
  const [showEmptyFields, setShowEmptyFields] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Extract entity ID from the row
  const getEntityId = () => {
    return selectedRow?.id || selectedRow?.content_id || null;
  };

  // Get entity class - support both requestClass and entityClass for backwards compatibility
  const getEntityClass = () => {
    return configDefinition.requestClass || configDefinition.entityClass || '';
  };

  // Get short entity class name
  const getShortEntityName = () => {
    const entityClass = getEntityClass();
    if (!entityClass) return '';
    const parts = entityClass.split('.');
    return parts[parts.length - 1];
  };

  // Load entity data function
  const loadEntity = async () => {
    const entityId = getEntityId();
    const entityClass = getEntityClass();
    if (!visible || !entityId || !entityClass) return;

    setLoading(true);
    try {
      const { data } = await getEntityLoad(entityId, entityClass);
      
      // Filter and sort data using HelperDetailEntity (like in Vue version)
      const filteredData = HelperDetailEntity.filterData(data);
      setEntity(filteredData);
    } catch (error) {
      console.error('Failed to load entity:', error);
      setEntity([]);
    } finally {
      setLoading(false);
    }
  };

  // Load entity data on mount and when dependencies change
  useEffect(() => {
    loadEntity();
  }, [visible, selectedRow, configDefinition.requestClass, configDefinition.entityClass]);

  // Reset tab when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab('details');
    }
  }, [visible]);

  // Helper to get value from entity array by column name
  const getValueFromColumn = (columnName: string) => {
    const column = entity.find((el: Entity) => el.columnInfo?.columnName === columnName);
    return column?.value || '-';
  };

  // Get standard fields
  const getStandardFields = () => {
    if (!entity || entity.length === 0) return {};
    
    return {
      id: getValueFromColumn('id') !== '-' ? getValueFromColumn('id') : getEntityId(),
      state: getValueFromColumn('state') !== '-' ? getValueFromColumn('state') : '-',
      previousTransition: getValueFromColumn('previousTransition'),
      createdDate: getValueFromColumn('creationDate'),
      lastUpdatedDate: getValueFromColumn('lastUpdateTime'),
    };
  };

  // Filter entity fields (remove standard fields only)
  const getEntityFields = () => {
    if (!entity || entity.length === 0) return [];
    
    // Only these fields go to "Standard fields" section
    const standardKeys = ['id', 'state', 'previousTransition', 'creationDate', 'createdDate'];
    
    return entity.filter((el: Entity) => {
      // Skip standard fields
      if (standardKeys.includes(el.columnInfo?.columnName || '')) {
        return false;
      }
      
      // Only filter LEAF type fields by value when showEmptyFields is false
      // Always show non-LEAF types (LIST, EMBEDDED, MAP)
      if (!showEmptyFields && el.type === 'LEAF') {
        if (!el.value || el.value === '' || el.value === '-') {
          return false;
        }
      }
      
      return true;
    });
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
            <div className="standard-fields">
              <p><span className="field-label">Id:</span> {standardFields.id}</p>
              <p><span className="field-label">State:</span> {standardFields.state}</p>
              <p><span className="field-label">Previous Transition:</span> {standardFields.previousTransition}</p>
              <p><span className="field-label">Created Date:</span> {standardFields.createdDate}</p>
              <p><span className="field-label">Last updated date:</span> {standardFields.lastUpdatedDate}</p>
            </div>
          </div>

          <Divider />

          {/* Transition Entity Section */}
          {getEntityId() && getEntityClass() && (
            <>
              <EntityTransitions
                entityId={getEntityId()!}
                entityClass={getEntityClass()}
                onTransitionChange={() => {
                  // Reload entity data after transition change
                  loadEntity();
                  // Trigger refresh for Data lineage tab
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
              <Divider />
            </>
          )}

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

            {/* Use EntityDetailTree for better nested field display */}
            <EntityDetailTree
              entity={entityFields}
              showEmpty={showEmptyFields}
              entityId={getEntityId()}
              entityClass={getEntityClass()}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'dataLineage',
      label: 'Data lineage',
      children: (
        <div className="entity-detail-tab">
          {visible && getEntityId() && getEntityClass() && (
            <EntityDataLineage
              key={refreshTrigger}
              entityClass={getEntityClass()}
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
          {visible && getEntityId() && getEntityClass() && (
            <EntityAudit
              key={refreshTrigger}
              entityClass={getEntityClass()}
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
