import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button, Divider, Empty, Spin, Modal, message, Badge } from 'antd';
import {
  ExpandOutlined,
  ShrinkOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  CodeOutlined,
  UploadOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import SourceDataNavigation from './SourceDataNavigation';
import TargetDataNavigation from './TargetDataNavigation';
import EntityNavigation from './EntityNavigation';
import MappingCanvas from './MappingCanvas';
import SearchPathsDialog from './SearchPathsDialog';
import { useDragDropHandler } from './DragDropHandler';
import { ScriptEditorDialog, ScriptEditorDialogRef } from './ScriptEditor';
import { DryRunSettingsDialog, DryRunResultDialog, DryRunSettingsDialogRef, DryRunResultDialogRef } from './DryRun';
import { ContentEditorDialog, ContentEditorDialogRef } from './ContentEditor';
import EntityMappingDialog, { EntityMappingDialogRef } from './EntityMappingDialog';
import ValidationErrorAlert from './ValidationErrorAlert';
import NotExistRelationsAlert from './NotExistRelationsAlert';
import ActiveRelationInformation from './ActiveRelationInformation';
import AssignMode from './AssignMode';
import MetaParams from './MetaParams';
import type {
  MappingConfigDto,
  EntityMappingConfigDto,
} from '../../types';
import './DataMapper.css';

interface DataMapperProps {
  dataMappingConfig: MappingConfigDto;
  sourceData: any;
  noneMappingFields?: string[];
  onSave?: (config: MappingConfigDto) => void;
  onEntityEdit?: (entityMapping: EntityMappingConfigDto) => void;
  onEntityDelete?: (entityMapping: EntityMappingConfigDto) => void;
  onEntityAdd?: () => void;
  onUploadFile?: () => void;
  onEditContent?: () => void;
  onEditCSVSettings?: () => void;
  onEditScript?: () => void;
}

const DataMapper: React.FC<DataMapperProps> = ({
  dataMappingConfig,
  sourceData,
  noneMappingFields = [],
  onSave,
  onEntityEdit,
  onEntityDelete,
  onEntityAdd,
  onUploadFile,
  onEditContent,
  onEditCSVSettings,
  onEditScript,
}) => {
  const [selectedEntityMappingIndex, setSelectedEntityMappingIndex] = useState(0);
  const [isLoadingTargetData] = useState(false);
  const [relationsUpdateTrigger, setRelationsUpdateTrigger] = useState(0);
  const [searchPathsVisible, setSearchPathsVisible] = useState(false);
  const [expandAllTrigger, setExpandAllTrigger] = useState(false);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(false);
  const [isSaveButtonTouched, setIsSaveButtonTouched] = useState(false);
  const [assignMode, setAssignMode] = useState<'single' | 'multiple'>('multiple');

  const canvasRef = useRef<HTMLDivElement>(null);
  const scriptEditorRef = useRef<ScriptEditorDialogRef>(null);
  const dryRunSettingsRef = useRef<DryRunSettingsDialogRef>(null);
  const dryRunResultRef = useRef<DryRunResultDialogRef>(null);
  const contentEditorRef = useRef<ContentEditorDialogRef>(null);
  const entityMappingDialogRef = useRef<EntityMappingDialogRef>(null);

  const selectedEntityMapping = dataMappingConfig.entityMappings[selectedEntityMappingIndex];

  // Handle mapping changes
  const handleMappingChange = useCallback((updatedMapping: EntityMappingConfigDto) => {
    const updatedConfig = {
      ...dataMappingConfig,
      entityMappings: dataMappingConfig.entityMappings.map((em, idx) =>
        idx === selectedEntityMappingIndex ? updatedMapping : em
      ),
    };
    if (onSave) {
      setIsSaveButtonTouched(true);
      onSave(updatedConfig);
    }
  }, [dataMappingConfig, selectedEntityMappingIndex, onSave]);

  // Trigger relations update
  const handleRelationsUpdate = useCallback(() => {
    setRelationsUpdateTrigger((prev) => prev + 1);
  }, []);

  // Initialize drag-drop handler
  const dragDropHandler = useDragDropHandler({
    selectedEntityMapping,
    onMappingChange: handleMappingChange,
    onRelationsUpdate: handleRelationsUpdate,
  });

  // Get source data for selected entity
  const getSourceDataForEntity = (): any => {
    if (!selectedEntityMapping || !sourceData) return {};

    // TODO: Apply srcRelativeRootPath transformation
    // For now, return the source data as-is
    return sourceData;
  };

  // Get all data relations for selected entity
  const getAllDataRelations = (): any[] => {
    if (!selectedEntityMapping) return [];

    const relations: any[] = [];

    // Helper to find jsonPath from cobiPathsRelations
    const findJsonPath = (srcPath: string, dstPath: string): string => {
      if (!selectedEntityMapping.cobiPathsRelations) return srcPath;
      const relation = selectedEntityMapping.cobiPathsRelations.find(
        (rel: any) => rel.srcColumnPath === srcPath && rel.dstColumnPath === dstPath
      );
      return relation?.jsonPath || srcPath;
    };

    // Column mappings
    selectedEntityMapping.columns.forEach((column: any) => {
      const jsonPath = findJsonPath(column.srcColumnPath, column.dstCyodaColumnPath);
      relations.push({
        type: 'columnMapping',
        column: {
          srcColumnPath: column.srcColumnPath,
          dstColumnPath: column.dstCyodaColumnPath,
          jsonPath: jsonPath,
        },
      });
    });

    // Functional mappings
    selectedEntityMapping.functionalMappings.forEach((funcMapping: any) => {
      funcMapping.srcPaths.forEach((srcPath: string) => {
        const jsonPath = findJsonPath(srcPath, funcMapping.dstPath);
        relations.push({
          type: 'functionalMapping',
          column: {
            srcColumnPath: srcPath,
            dstColumnPath: funcMapping.dstPath,
            jsonPath: jsonPath,
          },
        });
      });
    });

    // Core metadata
    if (selectedEntityMapping.cobiCoreMetadata) {
      selectedEntityMapping.cobiCoreMetadata.forEach((metadata: any) => {
        const jsonPath = findJsonPath(metadata.name, metadata.dstCyodaColumnPath);
        relations.push({
          type: 'cobiCoreMetadata',
          column: {
            srcColumnPath: metadata.name,
            dstColumnPath: metadata.dstCyodaColumnPath,
            jsonPath: jsonPath,
          },
        });
      });
    }

    return relations;
  };

  const allDataRelations = getAllDataRelations();
  const sourceDataForEntity = getSourceDataForEntity();

  // Expand/collapse all handlers
  const handleExpandAll = () => {
    setExpandAllTrigger(true);
  };

  const handleCollapseAll = () => {
    setCollapseAllTrigger(true);
  };

  const handleExpandCollapseComplete = () => {
    setExpandAllTrigger(false);
    setCollapseAllTrigger(false);
  };

  // Entity navigation handlers
  const handleEntityMappingChange = (index: number) => {
    setSelectedEntityMappingIndex(index);
  };

  const handleDeleteEntity = () => {
    if (selectedEntityMapping) {
      Modal.confirm({
        title: 'Delete Entity Mapping',
        content: `Are you sure you want to delete the entity mapping "${selectedEntityMapping.name}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          const updatedConfig = {
            ...dataMappingConfig,
            entityMappings: dataMappingConfig.entityMappings.filter(
              (em, idx) => idx !== selectedEntityMappingIndex
            ),
          };
          onSave?.(updatedConfig);

          // Also call the prop if provided
          onEntityDelete?.(selectedEntityMapping);

          // Reset to first entity
          setSelectedEntityMappingIndex(0);
          message.success('Entity mapping deleted successfully');
        },
      });
    }
  };

  // Relation handlers
  const handleRelationClick = (relations: any[]) => {
    console.log('Relation clicked:', relations);
    // TODO: Show relation settings dialog
  };

  const handleRelationHover = (_relations: any[]) => {
    // TODO: Highlight hovered relations
  };

  // Script Editor handler
  const handleOpenScriptEditor = () => {
    if (selectedEntityMapping) {
      scriptEditorRef.current?.open(
        selectedEntityMapping,
        dataMappingConfig,
        selectedEntityMappingIndex
      );
    }
  };

  const handleScriptEditorSave = (entityMapping: EntityMappingConfigDto) => {
    // Update the entity mapping in the config
    dataMappingConfig.entityMappings[selectedEntityMappingIndex] = entityMapping;
    console.log('Script saved:', entityMapping);
  };

  // Content Editor handler
  const handleEditContent = () => {
    if (dataMappingConfig.sampleContent) {
      contentEditorRef.current?.open(dataMappingConfig.sampleContent, dataMappingConfig.dataType);
    }
  };

  const handleContentEditorSave = (content: string) => {
    // Update the sample content
    const updatedConfig = {
      ...dataMappingConfig,
      sampleContent: content,
    };
    onSave?.(updatedConfig);

    // Call the parent's onEditContent if provided
    onEditContent?.();
  };

  // Entity Mapping Dialog handlers
  const handleEditEntity = () => {
    if (selectedEntityMapping) {
      entityMappingDialogRef.current?.editEntity(selectedEntityMapping);
    }
  };

  const handleAddEntity = () => {
    entityMappingDialogRef.current?.createNew();
  };

  const handleEntityMappingSave = (entityMapping: EntityMappingConfigDto) => {
    // Add new entity mapping
    const updatedConfig = {
      ...dataMappingConfig,
      entityMappings: [...dataMappingConfig.entityMappings, entityMapping],
    };
    onSave?.(updatedConfig);
  };

  const handleEntityMappingEdit = (data: { entityMapping: EntityMappingConfigDto; index: number }) => {
    // Update existing entity mapping
    const updatedEntityMappings = [...dataMappingConfig.entityMappings];
    updatedEntityMappings[data.index] = data.entityMapping;
    const updatedConfig = {
      ...dataMappingConfig,
      entityMappings: updatedEntityMappings,
    };
    onSave?.(updatedConfig);
    handleRelationsUpdate();
  };

  // Search Paths handler
  const handleOpenSearchPaths = () => {
    setSearchPathsVisible(true);
  };

  const handleCloseSearchPaths = () => {
    setSearchPathsVisible(false);
  };

  // Dry Run handlers
  const handleOpenDryRunSettings = () => {
    dryRunSettingsRef.current?.open();
  };

  const handleRunDryRun = async (settings: any) => {
    console.log('Running dry run with settings:', settings);
    // TODO: Call actual dry run API
    // For now, show mock result
    const mockResult = {
      mappedData: { sample: 'data' },
      entities: [{ id: 1, name: 'Entity 1' }],
      parseStatistic: { totalRecords: 100, successfulRecords: 95 },
      tracerEvents: [
        { level: 'INFO', timestamp: new Date().toISOString(), message: 'Dry run started' },
        { level: 'INFO', timestamp: new Date().toISOString(), message: 'Processing completed' },
      ],
    };
    dryRunResultRef.current?.open(mockResult);
  };

  const isCanBeUploadedFile = ['JSON', 'XML', 'CSV'].includes(dataMappingConfig.dataType || '');

  // Get all target field paths for validation
  const getAllTargetFields = (): string[] => {
    // This should be populated from the entity schema
    // For now, return empty array - will be populated when entity data is loaded
    return noneMappingFields || [];
  };

  // Handle deletion of non-existent relations
  const handleDeleteNotExistRelation = useCallback((relation: any) => {
    if (!selectedEntityMapping) return;

    const updatedMapping = { ...selectedEntityMapping };

    if (relation.type === 'columnMapping') {
      updatedMapping.columns = updatedMapping.columns.filter(
        (col) => col !== relation.data
      );
    } else if (relation.type === 'functionalMapping') {
      updatedMapping.functionalMappings = updatedMapping.functionalMappings.filter(
        (fm) => fm !== relation.data
      );
    } else if (relation.type === 'metadata') {
      updatedMapping.cobiCoreMetadata = updatedMapping.cobiCoreMetadata?.filter(
        (meta) => meta !== relation.data
      ) || [];
    }

    handleMappingChange(updatedMapping);
    message.success('Relation deleted successfully');
  }, [selectedEntityMapping, handleMappingChange]);

  // Check if source data root is an array
  const isRootElementIsArray = useMemo(() => {
    if (!sourceData) return false;
    const rootPath = selectedEntityMapping?.sourceRelativeRootPath || '';
    if (!rootPath) return Array.isArray(sourceData);

    // Navigate to the root path
    const parts = rootPath.split('/').filter(p => p);
    let current = sourceData;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }
    return Array.isArray(current);
  }, [sourceData, selectedEntityMapping?.sourceRelativeRootPath]);

  // Get meta params (if any)
  const metaParams = useMemo(() => {
    // This would come from the entity schema or configuration
    // For now, return empty array
    return [];
  }, []);

  return (
    <div className="data-mapper">
      {/* Active Relation Information */}
      <ActiveRelationInformation
        isActive={!!dragDropHandler.activeLine}
        onCancel={() => dragDropHandler.stopDrag()}
      />

      {/* Validation Error Alert */}
      <ValidationErrorAlert
        entityMapping={selectedEntityMapping}
        isSaveButtonTouched={isSaveButtonTouched}
      />

      {/* Not Exist Relations Alert */}
      <NotExistRelationsAlert
        entityMapping={selectedEntityMapping}
        sourceData={sourceData}
        targetFields={getAllTargetFields()}
        onDeleteRelation={handleDeleteNotExistRelation}
      />

      {/* Navigation Actions */}
      <div className="mapping-navigation">
        <div className="mapping-navigation-actions">
          <Button type="primary" icon={<ExpandOutlined />} onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button type="primary" icon={<ShrinkOutlined />} onClick={handleCollapseAll}>
            Collapse All
          </Button>
          <EntityNavigation
            dataMappingConfigDto={dataMappingConfig}
            onChange={handleEntityMappingChange}
          />
          {selectedEntityMapping && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEditEntity}>
              Edit Entity
            </Button>
          )}
          {isCanBeUploadedFile && (
            <>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                disabled={selectedEntityMappingIndex === 0}
                onClick={handleDeleteEntity}
              >
                Delete Entity
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEntity}>
                Add Entity
              </Button>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleOpenSearchPaths}>
                Search Paths
              </Button>
            </>
          )}
          <Divider type="vertical" />
          <Button
            type="default"
            icon={<ExperimentOutlined />}
            onClick={handleOpenScriptEditor}
            title="Open Script Editor"
          >
            Script Editor
          </Button>
          <Button
            type="default"
            icon={<PlayCircleOutlined />}
            onClick={handleOpenDryRunSettings}
            title="Run Dry Run Test"
          >
            Dry Run
          </Button>
        </div>
      </div>

      <Divider className="divider" />

      {/* Headers */}
      <div className="data-mapper-headers">
        <div className="col-data col-data-source">
          <div className="wrap-title">
            <h2>Source</h2>
            {isRootElementIsArray && selectedEntityMapping && (
              <AssignMode
                value={assignMode}
                onChange={(mode) => {
                  setAssignMode(mode);
                  handleRelationsUpdate();
                }}
                allDataRelations={allDataRelations}
                isRoot={true}
                selectedEntityMapping={selectedEntityMapping}
              />
            )}
          </div>
          {dataMappingConfig.sampleContent && isCanBeUploadedFile && (
            <div className="header-actions">
              <Button icon={<CodeOutlined />} onClick={handleEditContent} title="Edit content">
                Edit
              </Button>
              <Button icon={<UploadOutlined />} onClick={onUploadFile} title="Upload new file">
                Upload
              </Button>
              {dataMappingConfig.dataType === 'CSV' && (
                <Button icon={<FileTextOutlined />} onClick={onEditCSVSettings} title="CSV Settings">
                  CSV
                </Button>
              )}
              <Button type="primary" onClick={onEditScript} title="Edit script file">
                Script
              </Button>
            </div>
          )}
        </div>
        <div className="col-data col-data-target">
          {selectedEntityMapping && (
            <>
              <h2>Target</h2>
              <h3 className="col-data-target-entity-title">
                <small>Entity:</small>{' '}
                {selectedEntityMapping.filter ? (
                  <Badge count="Filter" style={{ backgroundColor: '#faad14' }}>
                    <span style={{ marginRight: 8 }}>
                      {selectedEntityMapping.entityClass || 'Not selected'}
                    </span>
                  </Badge>
                ) : (
                  <span>{selectedEntityMapping.entityClass || 'Not selected'}</span>
                )}
              </h3>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div ref={canvasRef} className="mapping-content">
        <div className="mapping-container">
          {/* Source Data Column */}
          <div className="source-data-column">
            {sourceDataForEntity && Object.keys(sourceDataForEntity).length > 0 ? (
              <SourceDataNavigation
                sourceData={sourceDataForEntity}
                selectedEntityMapping={selectedEntityMapping}
                allDataRelations={allDataRelations}
                dragDropHandler={dragDropHandler}
                expandAll={expandAllTrigger}
                collapseAll={collapseAllTrigger}
                onExpandCollapseComplete={handleExpandCollapseComplete}
              />
            ) : (
              <Empty description="Data not found. Perhaps an incorrect path to the data is specified in the Source Relative Root Path field.">
                <Button type="primary" icon={<EditOutlined />} onClick={handleEditEntity}>
                  Entity Settings
                </Button>
              </Empty>
            )}

            {/* Meta Params */}
            {metaParams.length > 0 && selectedEntityMapping && (
              <MetaParams
                metaParams={metaParams}
                allDataRelations={allDataRelations}
                selectedEntityMapping={selectedEntityMapping}
                onRelationsUpdate={handleRelationsUpdate}
              />
            )}
          </div>

          {/* SVG Canvas */}
          <MappingCanvas
            selectedEntityMapping={selectedEntityMapping}
            allDataRelations={allDataRelations}
            onRelationClick={handleRelationClick}
            onRelationHover={handleRelationHover}
            activeLine={dragDropHandler.activeLine}
            activeRelation={dragDropHandler.activeRelation}
            relationsUpdateTrigger={relationsUpdateTrigger}
          />

          {/* Target Data Column */}
          <div className="target-data-column">
            {selectedEntityMapping ? (
              <Spin spinning={isLoadingTargetData}>
                <TargetDataNavigation
                  selectedEntityMapping={selectedEntityMapping}
                  allDataRelations={allDataRelations}
                  noneMappingFields={noneMappingFields}
                  dragDropHandler={dragDropHandler}
                  expandAll={expandAllTrigger}
                  collapseAll={collapseAllTrigger}
                  onExpandCollapseComplete={handleExpandCollapseComplete}
                />
              </Spin>
            ) : (
              <Empty description="No entity mapping selected" />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ScriptEditorDialog ref={scriptEditorRef} onSave={handleScriptEditorSave} />
      <ContentEditorDialog ref={contentEditorRef} onSave={handleContentEditorSave} />
      <EntityMappingDialog
        ref={entityMappingDialogRef}
        dataMappingConfigDto={dataMappingConfig}
        sourceData={sourceData}
        noneMappingFields={noneMappingFields}
        isFirst={dataMappingConfig.entityMappings.length === 0}
        onSave={handleEntityMappingSave}
        onEdit={handleEntityMappingEdit}
      />
      <SearchPathsDialog
        visible={searchPathsVisible}
        entityMapping={selectedEntityMapping}
        onClose={handleCloseSearchPaths}
      />
      <DryRunSettingsDialog ref={dryRunSettingsRef} onSave={handleRunDryRun} />
      <DryRunResultDialog ref={dryRunResultRef} />
    </div>
  );
};

export default DataMapper;

