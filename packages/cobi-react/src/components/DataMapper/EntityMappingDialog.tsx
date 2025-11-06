import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Alert, Button, message } from 'antd';
import { EntitySelection } from './EntitySelection';
import type { EntityMappingConfigDto, MappingConfigDto } from '../../types';
import './EntityMappingDialog.css';

export interface EntityMappingDialogRef {
  createNew: () => void;
  editEntity: (entityMapping: EntityMappingConfigDto) => void;
}

interface EntityMappingDialogProps {
  dataMappingConfigDto: MappingConfigDto;
  sourceData: any;
  noneMappingFields?: string[];
  isFirst?: boolean;
  onSave?: (entityMapping: EntityMappingConfigDto) => void;
  onEdit?: (data: { entityMapping: EntityMappingConfigDto; index: number }) => void;
}

const EntityMappingDialog = forwardRef<EntityMappingDialogRef, EntityMappingDialogProps>(
  ({ dataMappingConfigDto, sourceData, noneMappingFields = [], isFirst = false, onSave, onEdit }, ref) => {
    const [visible, setVisible] = useState(false);
    const [action, setAction] = useState<'' | 'popup:edit'>('');
    const [entityMapping, setEntityMapping] = useState<EntityMappingConfigDto | null>(null);
    const [dataBefore, setDataBefore] = useState<EntityMappingConfigDto | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      createNew: () => {
        setAction('');
        setDataBefore(null);
        setErrors([]);
        
        // Get next uiId
        const uiIds = dataMappingConfigDto.entityMappings.map(em => em.id.uiId || 0);
        const nextUiId = uiIds.length > 0 ? Math.max(...uiIds) + 1 : 1;
        
        // Create new entity mapping
        const newEntityMapping: EntityMappingConfigDto = {
          id: {
            id: null,
            uiId: nextUiId,
          },
          name: '',
          entityClass: null,
          entityRelationConfigs: [
            {
              srcRelativeRootPath: '',
              parentRelationPath: '',
              parentEntityClass: null,
            },
          ],
          columns: [],
          functionalMappings: [],
          columnPathsForUniqueCheck: [],
          metadata: [],
          entityFilter: {
            '@bean': 'com.cyoda.core.conditions.GroupCondition',
            operator: 'AND',
            conditions: [],
          },
          isShowNoneMappingFields: false,
          isPolymorphicList: false,
          cobiCoreMetadata: [],
          cobiPathsRelations: [],
          script: {
            inputSrcPaths: [],
            inputMetaPaths: [],
            reusableScripts: [],
            body: '',
          },
        };
        
        setEntityMapping(newEntityMapping);
        setVisible(true);
      },
      
      editEntity: (em: EntityMappingConfigDto) => {
        setAction('popup:edit');
        setDataBefore(em);
        setEntityMapping(JSON.parse(JSON.stringify(em))); // Deep clone
        setErrors([]);
        setVisible(true);
      },
    }));

    const handleClose = () => {
      setVisible(false);
      setEntityMapping(null);
      setDataBefore(null);
      setErrors([]);
    };

    const handleAdd = () => {
      if (!entityMapping) return;
      
      // Basic validation
      const validationErrors: string[] = [];
      if (!entityMapping.entityClass) {
        validationErrors.push('Entity Class is required');
      }
      if (!entityMapping.name) {
        validationErrors.push('Entity Name is required');
      }
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      onSave?.(entityMapping);
      message.success('Entity mapping added successfully');
      handleClose();
    };

    const handleEdit = () => {
      if (!entityMapping || !dataBefore) return;
      
      // Basic validation
      const validationErrors: string[] = [];
      if (!entityMapping.entityClass) {
        validationErrors.push('Entity Class is required');
      }
      if (!entityMapping.name) {
        validationErrors.push('Entity Name is required');
      }
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Find index of entity being edited
      const index = dataMappingConfigDto.entityMappings.findIndex(
        em => em.id.uiId === dataBefore.id.uiId
      );
      
      if (index !== -1) {
        onEdit?.({ entityMapping, index });
        message.success('Entity mapping updated successfully');
        handleClose();
      }
    };

    const handleEntityMappingChange = (updatedEntityMapping: EntityMappingConfigDto) => {
      setEntityMapping(updatedEntityMapping);
    };

    return (
      <Modal
        title="Entity"
        open={visible}
        onCancel={handleClose}
        width="90%"
        destroyOnClose
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
          dataBefore ? (
            <Button key="edit" type="primary" onClick={handleEdit}>
              Edit
            </Button>
          ) : (
            <Button key="add" type="primary" onClick={handleAdd}>
              Add
            </Button>
          ),
        ]}
        className="entity-mapping-dialog"
      >
        {errors.length > 0 && (
          <Alert
            message="Errors"
            description={
              <ol>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ol>
            }
            type="error"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}
        
        {entityMapping && (
          <div className="dialog-entity">
            <EntitySelection
              sourceData={sourceData}
              noneMappingFields={noneMappingFields}
              isFirst={isFirst}
              action={action}
              dataMappingConfigDto={{
                ...dataMappingConfigDto,
                entityMappings: [entityMapping],
              }}
              onEntityMappingChange={handleEntityMappingChange}
            />
          </div>
        )}
      </Modal>
    );
  }
);

EntityMappingDialog.displayName = 'EntityMappingDialog';

export default EntityMappingDialog;

