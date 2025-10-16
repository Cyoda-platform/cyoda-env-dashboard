import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Tabs, Divider, Button, TreeSelect } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { EntityMappingConfigDto, ParentRelationConfigDto, MappingConfigDto } from '../../types';
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

  // TODO: Replace with actual API call to fetch entities
  const entitiesData: EntityOption[] = [];
  const isLoadingEntities = false;

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
                  <p>Filter Builder component will be implemented here</p>
                  {/* FilterBuilder component will be added later */}
                </div>
              ),
            },
            {
              key: 'fields',
              label: 'Fields',
              children: (
                <div style={{ padding: 16 }}>
                  <p>Entity fields will be displayed here</p>
                  {/* Entity fields display will be added later */}
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

