import React, { useState, useRef, useCallback } from 'react';
import { Button, Divider, Empty, Spin } from 'antd';
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
import { useDragDropHandler } from './DragDropHandler';
import { ScriptEditorDialog, ScriptEditorDialogRef } from './ScriptEditor';
import { DryRunSettingsDialog, DryRunResultDialog, DryRunSettingsDialogRef, DryRunResultDialogRef } from './DryRun';
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const scriptEditorRef = useRef<ScriptEditorDialogRef>(null);
  const dryRunSettingsRef = useRef<DryRunSettingsDialogRef>(null);
  const dryRunResultRef = useRef<DryRunResultDialogRef>(null);

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

    // Column mappings
    selectedEntityMapping.columns.forEach((column: any) => {
      relations.push({
        type: 'columnMapping',
        column: {
          srcColumnPath: column.srcColumnPath,
          dstColumnPath: column.dstCyodaColumnPath,
          jsonPath: column.srcColumnPath, // TODO: Get from cobiPathsRelations
        },
      });
    });

    // Functional mappings
    selectedEntityMapping.functionalMappings.forEach((funcMapping: any) => {
      funcMapping.srcPaths.forEach((srcPath: string) => {
        relations.push({
          type: 'functionalMapping',
          column: {
            srcColumnPath: srcPath,
            dstColumnPath: funcMapping.dstPath,
            jsonPath: srcPath,
          },
        });
      });
    });

    // Core metadata
    if (selectedEntityMapping.cobiCoreMetadata) {
      selectedEntityMapping.cobiCoreMetadata.forEach((metadata: any) => {
        relations.push({
          type: 'cobiCoreMetadata',
          column: {
            srcColumnPath: metadata.name,
            dstColumnPath: metadata.dstCyodaColumnPath,
            jsonPath: metadata.name,
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
    // TODO: Implement expand all logic
    console.log('Expand all');
  };

  const handleCollapseAll = () => {
    // TODO: Implement collapse all logic
    console.log('Collapse all');
  };

  // Entity navigation handlers
  const handleEntityMappingChange = (index: number) => {
    setSelectedEntityMappingIndex(index);
  };

  const handleEditEntity = () => {
    if (selectedEntityMapping && onEntityEdit) {
      onEntityEdit(selectedEntityMapping);
    }
  };

  const handleDeleteEntity = () => {
    if (selectedEntityMapping && onEntityDelete) {
      onEntityDelete(selectedEntityMapping);
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

  return (
    <div className="data-mapper">
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
              <Button type="primary" icon={<PlusOutlined />} onClick={onEntityAdd}>
                Add Entity
              </Button>
              <Button type="primary" icon={<SearchOutlined />}>
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
          </div>
          {dataMappingConfig.sampleContent && isCanBeUploadedFile && (
            <div className="header-actions">
              <Button icon={<CodeOutlined />} onClick={onEditContent} title="Edit content">
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
                <small>Entity:</small> {selectedEntityMapping.entityClass || 'Not selected'}
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
              />
            ) : (
              <Empty description="Data not found. Perhaps an incorrect path to the data is specified in the Source Relative Root Path field.">
                <Button type="primary" icon={<EditOutlined />} onClick={handleEditEntity}>
                  Entity Settings
                </Button>
              </Empty>
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
      <DryRunSettingsDialog ref={dryRunSettingsRef} onSave={handleRunDryRun} />
      <DryRunResultDialog ref={dryRunResultRef} />
    </div>
  );
};

export default DataMapper;

