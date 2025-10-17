import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Select, Switch, Tabs, Divider, Button, TreeSelect } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEntityTypes, useReportingInfo } from '../../hooks';
import type { EntityMappingConfigDto, ParentRelationConfigDto, MappingConfigDto } from '../../types';
import { FilterBuilder } from './FilterBuilder';
import type { ColumnInfo, FilterGroup } from './FilterBuilder/types';
import './EntitySelection.css';

interface EntitySelectionProps {
  sourceData?: any;
  noneMappingFields?: string[];
  isFirst?: boolean;
  action?: string;
  dataMappingConfigDto: MappingConfigDto;
  onEntityMappingChange?: (entityMapping: EntityMappingConfigDto) => void;
}

interface EntityOption {
  label: string;
  value: string;
}

export const EntitySelection: React.FC<EntitySelectionProps> = ({
  sourceData,
  noneMappingFields = [],
  isFirst = false,
  action = '',
  dataMappingConfigDto,
  onEntityMappingChange,
}) => {
  const [form] = Form.useForm();

  // Fetch entity types
  const { data: entityTypes, isLoading: isLoadingEntities } = useEntityTypes(false);

  // Convert entity types to options
  const entitiesData: EntityOption[] = React.useMemo(() => {
    if (!entityTypes || !Array.isArray(entityTypes)) {
      return [];
    }
    return entityTypes.map((entityType: string) => ({
      label: entityType.split('.').pop() || entityType, // Show short name
      value: entityType,
    }));
  }, [entityTypes]);

  // Test data generator
  const generateTestEntityMapping = (): EntityMappingConfigDto => {
    return {
      id: { id: 'test-entity-123', uiId: 1 },
      name: 'Test Organisation Mapping',
      entityClass: 'org.net.cyoda.saas.model.dto.Organisation',
      entityRelationConfigs: [
        {
          parentId: undefined,
          srcRelativeRootPath: 'root:/organisations/*',
          currentEntityIdPath: 'id',
          parentEntityIdPath: null,
        },
      ],
      columns: [
        {
          srcColumnPath: 'name',
          dstCyodaColumnPath: 'org@net#cyoda#saas#model#dto#Organisation.name',
          transformer: {
            type: 'COMPOSITE',
            children: [
              {
                type: 'STRING',
                transformerKey: 'TRIM',
                parameters: {},
              },
            ],
          },
          dstCyodaColumnPathType: 'String',
          dstCollectionElementSetModes: [],
        },
        {
          srcColumnPath: 'registrationNumber',
          dstCyodaColumnPath: 'org@net#cyoda#saas#model#dto#Organisation.idAtRegistry',
          transformer: {
            type: 'SINGLE',
            children: [],
          },
          dstCyodaColumnPathType: 'String',
          dstCollectionElementSetModes: [],
        },
        {
          srcColumnPath: 'address.street',
          dstCyodaColumnPath: 'org@net#cyoda#saas#model#dto#Organisation.addresses.[*]@net#cyoda#saas#model#dto#Address.line1',
          transformer: {
            type: 'COMPOSITE',
            children: [
              {
                type: 'STRING',
                transformerKey: 'UPPERCASE',
                parameters: {},
              },
            ],
          },
          dstCyodaColumnPathType: 'String',
          dstCollectionElementSetModes: [{ type: 'OVERRIDE' }],
        },
      ],
      functionalMappings: [
        {
          '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto',
          name: 'Calculate Full Address',
          srcPaths: ['address.street', 'address.city', 'address.postalCode'],
          statements: [
            {
              type: 'ASSIGN_VAR',
              variableName: 'street',
              expression: {
                '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.SrcValueReadExpressionConfigDto',
                srcPath: 'address.street',
                constantSource: 'INPUT',
                args: [],
              },
              collectElemsSetModes: [],
            },
            {
              type: 'RETURN',
              expression: {
                '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.VarReadExpressionConfigDto',
                variableName: 'street',
                constantSource: 'INPUT',
                args: [],
              },
              collectElemsSetModes: [],
            },
          ],
          dstPath: 'org@net#cyoda#saas#model#dto#Organisation.addresses.[*]@net#cyoda#saas#model#dto#Address.fullAddress',
          collectElemsSetModes: [{ type: 'OVERRIDE' }],
          metaPaths: [],
        },
      ],
      columnPathsForUniqueCheck: ['org@net#cyoda#saas#model#dto#Organisation.idAtRegistry'],
      metadata: [
        {
          name: 'source',
          dstCyodaColumnPath: 'org@net#cyoda#saas#model#dto#Organisation.metadata.source',
          dstCyodaColumnPathType: 'String',
          transformer: {
            type: 'SINGLE',
            children: [],
          },
        },
      ],
      entityFilter: {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'AND',
        conditions: [
          {
            '@bean': 'com.cyoda.core.conditions.queryable.Equals',
            fieldName: 'org@net#cyoda#saas#model#dto#Organisation.status',
            operation: 'EQUALS',
            value: {
              '@type': 'String',
              value: 'ACTIVE',
            },
          },
          {
            '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
            fieldName: 'org@net#cyoda#saas#model#dto#Organisation.employeeCount',
            operation: 'GREATER_THAN',
            value: {
              '@type': 'Integer',
              value: '10',
            },
          },
        ],
      },
      isShowNoneMappingFields: true,
      isPolymorphicList: false,
      cobiCoreMetadata: [
        {
          name: 'importDate',
          dstCyodaColumnPath: 'org@net#cyoda#saas#model#dto#Organisation.metadata.importDate',
        },
      ],
      cobiPathsRelations: [
        {
          jsonPath: '$.organisations[*]',
          srcColumnPath: 'organisations',
          dstColumnPath: 'org@net#cyoda#saas#model#dto#Organisation',
        },
      ],
      script: {
        inputSrcPaths: ['name', 'registrationNumber'],
        inputMetaPaths: ['metadata.source'],
        reusableScripts: ['validateOrganisation', 'enrichData'],
        body: 'function transform(input) {\n  return input.name.toUpperCase();\n}',
      },
    };
  };

  // Initialize entity mapping
  const [entityMapping, setEntityMapping] = useState<EntityMappingConfigDto>(() => {
    if (dataMappingConfigDto.entityMappings && dataMappingConfigDto.entityMappings.length > 0) {
      return dataMappingConfigDto.entityMappings[0];
    }
    return {
      id: { id: null, uiId: 1 },
      name: '',
      entityClass: null,
      entityRelationConfigs: [
        {
          parentId: undefined,
          srcRelativeRootPath: '',
          currentEntityIdPath: '',
          parentEntityIdPath: '',
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
      isShowNoneMappingFields: true,
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
  });

  const [_showErrors, _setShowErrors] = useState(false);

  // Fetch reporting info for filter builder
  const { data: reportingInfo } = useReportingInfo(
    entityMapping.entityClass,
    undefined,
    undefined,
    false
  );

  // Convert reporting info to columns for filter builder
  const filterBuilderCols: ColumnInfo[] = useMemo(() => {
    if (!reportingInfo || !Array.isArray(reportingInfo)) {
      return [];
    }

    return reportingInfo.map((field: any) => ({
      alias: field.alias || field.columnPath || '',
      type: field.type || 'String',
      typeShort: field.typeShort || field.type || 'String',
      label: field.label || field.alias || '',
    }));
  }, [reportingInfo]);

  // Get entity options
  const entityOptions: EntityOption[] = React.useMemo(() => {
    if (!entitiesData || entitiesData.length === 0) return [];

    // Filter out already selected entities
    const selectedEntities = dataMappingConfigDto.entityMappings?.map((em: EntityMappingConfigDto) => em.entityClass) || [];

    return entitiesData
      .filter((entity: EntityOption) => !selectedEntities.includes(entity.value))
      .map((entity: EntityOption) => ({
        label: entity.label,
        value: entity.value,
      }));
  }, [entitiesData, dataMappingConfigDto.entityMappings]);

  // Get source relative root path options
  const getSrcRelativeRootPathOptions = (
    _entityRelationConfig: ParentRelationConfigDto
  ): any[] => {
    if (!sourceData) return [];

    const buildTreeFromPath = (_path: string, data: any): any => {
      const result: any[] = [];

      const traverse = (obj: any, currentPath: string, _level: number): void => {
        if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach((key) => {
            const newPath = currentPath ? `${currentPath}/${key}` : key;
            const fullPath = `root:/${newPath}`;

            result.push({
              value: fullPath,
              label: fullPath,
              labelShort: key,
              children: [],
            });

            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key], newPath, _level + 1);
            }
          });
        }
      };

      traverse(data, '', 0);
      return result;
    };

    return buildTreeFromPath('', sourceData);
  };

  // Determine default source relative root path
  const getDefaultSrcRelativeRootPath = (): string => {
    const dataType = dataMappingConfigDto.dataType;
    if (dataType === 'BINARY_DOC') return 'root:/';
    if (dataType === 'CSV') return 'root:/*';
    return '';
  };

  // Check if file can be uploaded
  const isCanBeUploadedFile = (): boolean => {
    const dataType = dataMappingConfigDto.dataType;
    return dataType === 'CSV' || dataType === 'XML' || dataType === 'JSON';
  };

  // Check if disabled
  const isDisabled = (): boolean => {
    return dataMappingConfigDto.dataType === 'CSV';
  };

  // Show polymorphic list option
  const isShowIsPolymorphicList = (): boolean => {
    return dataMappingConfigDto.dataType !== 'CSV';
  };

  // Add new relation config
  const addNewConfig = () => {
    const newConfig: ParentRelationConfigDto = {
      parentId: undefined,
      srcRelativeRootPath: getDefaultSrcRelativeRootPath(),
      currentEntityIdPath: '',
      parentEntityIdPath: '',
    };

    setEntityMapping((prev) => ({
      ...prev,
      entityRelationConfigs: [...prev.entityRelationConfigs, newConfig],
    }));
  };

  // Remove relation config
  const removeConfig = (index: number) => {
    setEntityMapping((prev) => ({
      ...prev,
      entityRelationConfigs: prev.entityRelationConfigs.filter((_, i) => i !== index),
    }));
  };

  // Validate entity name uniqueness
  const checkNameUnique = (_: any, value: string) => {
    if (!value) return Promise.resolve();

    const existingNames = dataMappingConfigDto.entityMappings
      ?.filter((em) => em.id.uiId !== entityMapping.id.uiId)
      .map((em) => em.name) || [];

    if (existingNames.includes(value)) {
      return Promise.reject(new Error('Entity mapping name must be unique'));
    }

    return Promise.resolve();
  };

  // Load test data
  const handleLoadTestData = () => {
    const testMapping = generateTestEntityMapping();
    setEntityMapping(testMapping);
    onEntityMappingChange?.(testMapping);
    form.setFieldsValue({
      entityName: testMapping.name,
      entityClass: testMapping.entityClass,
    });
  };

  // Update form when entity mapping changes
  useEffect(() => {
    form.setFieldsValue(entityMapping);
  }, [entityMapping, form]);

  // Notify parent of changes
  useEffect(() => {
    if (onEntityMappingChange) {
      onEntityMappingChange(entityMapping);
    }
  }, [entityMapping, onEntityMappingChange]);

  // Handle form value changes
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    setEntityMapping((prev) => ({
      ...prev,
      ...allValues,
    }));
  };

  return (
    <div className="entity-selection">
      {/* Test Data Button */}
      <div style={{ marginBottom: 16, padding: 12, background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>🧪 Testing Mode</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
              Load sample entity mapping data to test the FilterBuilder and Fields tabs
            </p>
          </div>
          <Button
            type="primary"
            onClick={handleLoadTestData}
            style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Load Test Data
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={entityMapping}
        onValuesChange={handleValuesChange}
      >
        {noneMappingFields && noneMappingFields.length > 0 && (
          <Form.Item
            label="Hide non-mapping COBI fields?"
            name="isShowNoneMappingFields"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        {isShowIsPolymorphicList() && (
          <Form.Item
            label="Is Polymorphic List?"
            name="isPolymorphicList"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please fill name field' },
            { validator: checkNameUnique },
          ]}
        >
          <Input placeholder="Name" />
        </Form.Item>

        <Form.Item
          label="Entity Class"
          name="entityClass"
          rules={[{ required: true, message: 'Please select Entity Class' }]}
        >
          <Select
            disabled={action === 'popup:edit'}
            loading={isLoadingEntities}
            placeholder="Please select"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={entityOptions}
          />
        </Form.Item>

        {entityMapping.entityRelationConfigs.map((entityRelationConfig, index) => (
          <div key={index}>
            {!isFirst && <h2 style={{ marginBottom: 10 }}>{index + 1}) Relation Config</h2>}

            {isCanBeUploadedFile() && (
              <>
                {!isDisabled() && (
                  <Form.Item
                    label="Source Relative Root Path"
                    name={['entityRelationConfigs', index, 'srcRelativeRootPath']}
                    rules={[
                      {
                        required: true,
                        message: 'Please select Source Relative Root Path',
                      },
                    ]}
                  >
                    <TreeSelect
                      showSearch
                      treeDefaultExpandAll
                      placeholder="Please select"
                      treeData={getSrcRelativeRootPathOptions(entityRelationConfig)}
                      treeNodeLabelProp="labelShort"
                    />
                  </Form.Item>
                )}

                {index > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeConfig(index)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </>
            )}

            <Divider />
          </div>
        ))}

        {!isFirst && (
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addNewConfig}
            >
              Add New Relation Config
            </Button>
          </div>
        )}

        <Tabs
          type="card"
          items={[
            {
              key: 'filter',
              label: <span className={_showErrors ? 'has-error' : ''}>FilterBuilder</span>,
              children: (
                <div style={{ padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>Entity Filter Configuration</h4>
                  </div>

                  {entityMapping.entityFilter && (
                    <FilterBuilder
                      entityFilter={entityMapping.entityFilter as FilterGroup}
                      cols={filterBuilderCols}
                      showErrors={_showErrors}
                      readOnly={false}
                      onChange={(updatedFilter) => {
                        entityMapping.entityFilter = updatedFilter;
                        if (onEntityMappingChange) {
                          onEntityMappingChange(entityMapping);
                        }
                      }}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'fields',
              label: 'Fields',
              children: (
                <div style={{ padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>Entity Mapping Details</h4>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      {entityMapping.entityClass
                        ? `Complete mapping configuration for: ${entityMapping.entityClass.split('.').pop()}`
                        : 'Select an entity class to view mapping details'}
                    </p>
                  </div>

                  {entityMapping.entityClass ? (
                    <div>
                      {/* Entity Information */}
                      <div style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        border: '1px solid #d9d9d9',
                        marginBottom: 16
                      }}>
                        <h5 style={{ marginTop: 0, marginBottom: 12 }}>Entity Information</h5>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>ID:</strong> {entityMapping.id?.id || 'null'} (UI ID: {entityMapping.id?.uiId})
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Name:</strong> {entityMapping.name || '(not set)'}
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Entity Class:</strong> <code style={{ fontSize: '11px' }}>{entityMapping.entityClass}</code>
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Show Non-Mapping Fields:</strong> {entityMapping.isShowNoneMappingFields ? '✓ Yes' : '✗ No'}
                        </div>
                        <div style={{ fontSize: '13px' }}>
                          <strong>Polymorphic List:</strong> {entityMapping.isPolymorphicList ? '✓ Yes' : '✗ No'}
                        </div>
                      </div>

                      {/* Column Mappings */}
                      <div style={{ marginBottom: 16 }}>
                        <h5>Column Mappings ({entityMapping.columns?.length || 0})</h5>
                        {entityMapping.columns && entityMapping.columns.length > 0 ? (
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {entityMapping.columns.map((col: any, idx: number) => (
                              <div key={idx} style={{
                                marginBottom: 8,
                                padding: 10,
                                background: '#fafafa',
                                border: '1px solid #e8e8e8',
                                borderRadius: 4,
                                fontSize: '12px'
                              }}>
                                <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>
                                  Mapping #{idx + 1}
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Source:</strong> <code>{col.srcColumnPath}</code>
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Destination:</strong> <code>{col.dstCyodaColumnPath}</code>
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Type:</strong> {col.dstCyodaColumnPathType || 'N/A'}
                                </div>
                                {col.transformer && (
                                  <div>
                                    <strong>Transformer:</strong> {col.transformer.type} ({col.transformer.children?.length || 0} children)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: 12, background: '#fafafa', borderRadius: 4, color: '#999', fontSize: '13px' }}>
                            No column mappings configured yet. Add mappings in Step 4.
                          </div>
                        )}
                      </div>

                      {/* Functional Mappings */}
                      <div style={{ marginBottom: 16 }}>
                        <h5>Functional Mappings ({entityMapping.functionalMappings?.length || 0})</h5>
                        {entityMapping.functionalMappings && entityMapping.functionalMappings.length > 0 ? (
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {entityMapping.functionalMappings.map((fm: any, idx: number) => (
                              <div key={idx} style={{
                                marginBottom: 8,
                                padding: 10,
                                background: '#fff7e6',
                                border: '1px solid #ffd591',
                                borderRadius: 4,
                                fontSize: '12px'
                              }}>
                                <div style={{ fontWeight: 'bold', color: '#fa8c16', marginBottom: 4 }}>
                                  Functional Mapping #{idx + 1}
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Name:</strong> {fm.name || '(unnamed)'}
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Source Paths:</strong> {fm.srcPaths?.join(', ') || 'N/A'}
                                </div>
                                <div style={{ marginBottom: 3 }}>
                                  <strong>Destination:</strong> <code>{fm.dstPath}</code>
                                </div>
                                <div>
                                  <strong>Statements:</strong> {fm.statements?.length || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: 12, background: '#fafafa', borderRadius: 4, color: '#999', fontSize: '13px' }}>
                            No functional mappings configured.
                          </div>
                        )}
                      </div>

                      {/* Additional Configuration */}
                      <div style={{
                        padding: 16,
                        background: '#f0f5ff',
                        borderRadius: 4,
                        border: '1px solid #adc6ff'
                      }}>
                        <h5 style={{ marginTop: 0, marginBottom: 12 }}>Additional Configuration</h5>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Metadata Configs:</strong> {entityMapping.metadata?.length || 0}
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>COBI Core Metadata:</strong> {entityMapping.cobiCoreMetadata?.length || 0}
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>COBI Paths Relations:</strong> {entityMapping.cobiPathsRelations?.length || 0}
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Unique Check Paths:</strong> {entityMapping.columnPathsForUniqueCheck?.length || 0}
                        </div>
                        <div style={{ marginBottom: 6, fontSize: '13px' }}>
                          <strong>Entity Relation Configs:</strong> {entityMapping.entityRelationConfigs?.length || 0}
                        </div>
                        {entityMapping.script && (
                          <div style={{ fontSize: '13px' }}>
                            <strong>Script:</strong> {entityMapping.script.body ? `${entityMapping.script.body.length} chars` : 'Empty'}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 4 }}>
                        <strong>ℹ️ Note:</strong> Advanced entity field browser will be available in a future update.
                        Field mappings are created in Step 4 (Data Mapping) using the visual mapper.
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                      Please select an entity class above to view mapping details
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Form>
    </div>
  );
};

export default EntitySelection;

