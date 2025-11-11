/**
 * ModellingPopUpAliasNew Component
 * Unified alias creation/editing dialog for both Report Editor and Catalog of Aliases
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue
 */

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Table, Space, App, Tooltip, Checkbox, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axios } from '@cyoda/http-api-react';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';
import type { ReportMapper, NamedParameter, MapperParameters, CatalogItem, AliasDef, AliasDefColDef } from '@cyoda/http-api-react';
import { getMappers, getReportingFetchTypes } from '@cyoda/http-api-react';
import { ModellingPopUpToggles } from '../ModellingPopUpToggles';
import { ModellingPopUpSearch } from '../ModellingPopUpSearch';
import { ModellingGroup } from '../ModellingGroup';
import MapperParametersDialog, { MapperParametersDialogRef } from '../../MapperParametersDialog';
import type { ColDef, ReportDefinition } from '../../../types';
import type { ReportingInfoRow, RelatedPath } from '../../../types/modelling';
import { getReportingInfo, getReportingRelatedPaths } from '../../../api/modelling';
import HelperModelling from '../../../utils/HelperModelling';
import './ModellingPopUpAliasNew.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ModellingPopUpAliasNewProps {
  configDefinition?: ReportDefinition;
  onCreated?: (aliasDef: AliasDef) => void;
  onUpdated?: (aliasDef: AliasDef) => void;
  // Catalog mode props
  onCreate?: (item: CatalogItem) => void;
  onUpdate?: (id: string, item: CatalogItem) => void;
  // Control which steps to show
  allowSelectEntity?: boolean;
  allowConfigFile?: boolean;
  aliasEditType?: 'catalog' | 'report';
}

export interface ModellingPopUpAliasNewRef {
  open: (requestClassOrItem?: string | any, editItem?: any) => void;
  close: () => void;
}

// Local type that extends AliasDefColDef to allow MapperParameters object
interface AliasPathLocal {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: MapperParameters | string;
}

interface AliasForm {
  name: string;
  desc: string;
  aliasType: string;
  entityClass: string;
  aliasPaths: AliasPathLocal[];
}

export const ModellingPopUpAliasNew = forwardRef<ModellingPopUpAliasNewRef, ModellingPopUpAliasNewProps>(
  ({
    configDefinition,
    onCreated,
    onUpdated,
    onCreate,
    onUpdate,
    allowSelectEntity = false,
    allowConfigFile = true,
    aliasEditType = 'catalog'
  }, ref) => {
    const { message } = App.useApp();
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [aliasForm, setAliasForm] = useState<AliasForm>({
      name: '',
      desc: '',
      aliasType: 'SIMPLE',
      entityClass: '',
      aliasPaths: [],
    });
    const [editItem, setEditItem] = useState<any>(null);
    const [selectedColumns, setSelectedColumns] = useState<ColDef[]>([]);
    const mapperParametersDialogRef = useRef<MapperParametersDialogRef>(null);
    const [selectedMapperRow, setSelectedMapperRow] = useState<{ index: number; paramName?: string } | null>(null);

    // State for tree view in Paths step (catalog mode)
    const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);
    const [relatedPaths, setRelatedPaths] = useState<RelatedPath[]>([]);
    const [isVisibleGroup, setIsVisibleGroup] = useState(false);
    const [isOpenAllSelected, setIsOpenAllSelected] = useState(false);
    const [isCondenseThePaths, setIsCondenseThePaths] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch entity classes (for catalog mode)
    const { data: entityClasses = [] } = useQuery({
      queryKey: ['entityClasses'],
      queryFn: async () => {
        try {
          const { data } = await getReportingFetchTypes(false);
          console.log('Entity classes loaded:', data);
          // Ensure we always return an array
          if (!Array.isArray(data)) {
            console.warn('API returned non-array data, using empty list');
            return [];
          }
          // Extract just the class names from the entity data
          return data.map((entity: any) => entity.name || entity);
        } catch (error) {
          console.error('Failed to load entity classes:', error);
          return [];
        }
      },
      enabled: allowSelectEntity,
    });

    useImperativeHandle(ref, () => ({
      open: (requestClassOrItem?: string | any, item?: any) => {
        setVisible(true);
        setCurrentStep(0);

        // Support both calling conventions:
        // 1. open(requestClass, item) - new way with explicit requestClass
        // 2. open(item) - old way, extract entityClass from item
        let requestClass: string | undefined;
        let editItem: any;

        if (typeof requestClassOrItem === 'string') {
          // New way: open(requestClass, item)
          requestClass = requestClassOrItem;
          editItem = item;
        } else if (requestClassOrItem && typeof requestClassOrItem === 'object') {
          // Old way: open(item) - extract entityClass from item
          editItem = requestClassOrItem;
          requestClass = editItem.entityClass;
        } else {
          // Create mode: open() or open(undefined)
          editItem = null;
          requestClass = undefined;
        }

        setEditItem(editItem || null);

        if (editItem) {
          // Edit mode
          const paths = editItem.aliasDef.aliasPaths?.value || [];
          const entityClass = requestClass || editItem.entityClass || '';

          // Deserialize mapperParameters if it's a string
          const deserializedPaths: AliasPathLocal[] = paths.map((p: any) => ({
            ...p,
            mapperParameters: typeof p.mapperParameters === 'string'
              ? JSON.parse(p.mapperParameters)
              : p.mapperParameters,
          }));

          setAliasForm({
            name: editItem.aliasDef.name,
            desc: editItem.desc || '',
            aliasType: editItem.aliasDef.aliasType || 'SIMPLE',
            entityClass: entityClass,
            aliasPaths: deserializedPaths,
          });
          setSelectedColumns(paths.map((p: any) => p.colDef));
          form.setFieldsValue({
            name: editItem.aliasDef.name,
            desc: editItem.desc || '',
            entityClass: entityClass,
            aliasType: editItem.aliasDef.aliasType || 'SIMPLE',
          });
        } else {
          // Create mode
          setAliasForm({
            name: '',
            desc: '',
            aliasType: 'SIMPLE',
            entityClass: requestClass || '',
            aliasPaths: [],
          });
          setSelectedColumns([]);
          form.resetFields();
        }
      },
      close: () => setVisible(false),
    }));

    // Fetch available mappers with metadata
    const { data: allMappers = [] } = useQuery({
      queryKey: ['mappers'],
      queryFn: async () => {
        try {
          const { data } = await getMappers();
          console.log('All mappers loaded:', data);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Failed to load mappers:', error);
          return [];
        }
      },
    });

    // Load entity model when entity class changes (for tree view in Paths step)
    useEffect(() => {
      // For catalog mode: load when on Paths step (step 1)
      // For report mode: load when on Paths step (step 0)
      const pathsStepIndex = allowSelectEntity ? 1 : 0;

      if (aliasForm.entityClass && currentStep === pathsStepIndex) {
        const loadEntityModel = async () => {
          try {
            const { data: reportingInfo } = await getReportingInfo(aliasForm.entityClass);
            setReportingInfoRows(HelperModelling.sortData(HelperModelling.filterData(reportingInfo)));

            const { data: relatedData } = await getReportingRelatedPaths(aliasForm.entityClass);
            setRelatedPaths(relatedData);

            setIsVisibleGroup(false);
            setTimeout(() => setIsVisibleGroup(true), 0);
          } catch (error) {
            console.error('Failed to load entity model:', error);
          }
        };
        loadEntityModel();
      }
    }, [aliasForm.entityClass, allowSelectEntity, currentStep]);

    // Fetch mappers by type for each path
    const [mappersByType, setMappersByType] = useState<{ [key: string]: ReportMapper[] }>({});

    // Watch selectedColumns and update aliasPaths (for tree view mode)
    useEffect(() => {
      if (selectedColumns.length === 0) return;

      // Create alias paths from selected columns
      const newPaths: AliasPathLocal[] = selectedColumns.map((col) => {
        // Try to preserve existing mapper settings if the column was already selected
        const existingPath = aliasForm.aliasPaths.find((p) => p.colDef.fullPath === col.fullPath);

        return {
          colDef: col,
          mapperClass: existingPath?.mapperClass || 'com.cyoda.core.reports.aliasmappers.BasicMapper',
          mapperParameters: existingPath?.mapperParameters,
        };
      });

      // Auto-detect alias type from first column's field type (not Java type)
      const firstCol = selectedColumns[0] as any;
      const aliasType = selectedColumns.length > 0 ? (firstCol.fieldType || 'SIMPLE') : 'SIMPLE';

      // Auto-generate name from first column if name is empty
      let autoName = aliasForm.name;
      if (!autoName && selectedColumns.length > 0) {
        const firstPath = selectedColumns[0].fullPath;
        // Use full path with dots replaced by colons (like Vue project)
        autoName = firstPath.replaceAll('.', ':');
      }

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: newPaths,
        aliasType: aliasType,
        name: autoName || prev.name,
      }));

      // Update form field
      if (autoName && !form.getFieldValue('name')) {
        form.setFieldsValue({ name: autoName });
      }
    }, [selectedColumns, allowSelectEntity]);

    // Load mappers by type when paths change
    useEffect(() => {
      if (aliasForm.aliasPaths.length > 0 && currentStep === 3) {
        loadMappersByTypes();
      }
    }, [aliasForm.aliasPaths, currentStep]);

    const loadMappersByTypes = async () => {
      try {
        const uniqueTypes = Array.from(new Set(aliasForm.aliasPaths.map((p) => p.colDef.colType)));

        // Load mappers for each Java type
        const results = await Promise.allSettled(
          uniqueTypes.map((type) => getMappers({ inClass: type }))
        );

        const mappersByTypeObj: { [key: string]: ReportMapper[] } = {};

        // Process results for each type
        uniqueTypes.forEach((type, index) => {
          const key = type.replace(/\./g, '_');
          const result = results[index];
          if (result.status === 'fulfilled') {
            mappersByTypeObj[key] = result.value.data || [];
          } else {
            console.warn(`Failed to load mappers for type ${type}:`, result.reason);
            mappersByTypeObj[key] = [];
          }
        });

        setMappersByType(mappersByTypeObj);
      } catch (error) {
        console.error('Failed to load mappers by type:', error);
        setMappersByType({});
      }
    };

    const handleTogglesChange = (toggles: { isOpenAllSelected: boolean; isCondenseThePaths: boolean }) => {
      setIsOpenAllSelected(toggles.isOpenAllSelected);
      setIsCondenseThePaths(toggles.isCondenseThePaths);
    };

    const handleSearchChange = (searchData: { input: string }) => {
      setSearch(searchData.input);
    };

    const handleNext = async () => {
      try {
        await form.validateFields();
        const values = form.getFieldsValue();
        setAliasForm((prev) => ({ ...prev, ...values }));
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Validation failed
      }
    };

    const handlePrev = () => {
      setCurrentStep(currentStep - 1);
    };

    const handleRemovePath = (index: number) => {
      const newPaths = aliasForm.aliasPaths.filter((_, i) => i !== index);
      const newColumns = selectedColumns.filter((_, i) => i !== index);

      // Update alias type based on remaining columns (use fieldType, not colType)
      const firstCol = newColumns[0] as any;
      const aliasType = newColumns.length > 0 ? (firstCol?.fieldType || 'SIMPLE') : 'SIMPLE';

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: newPaths,
        aliasType: aliasType as 'SIMPLE' | 'COMPLEX',
      }));
      setSelectedColumns(newColumns);
    };

    const handleMapperChange = (index: number, mapperClass: string) => {
      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: prev.aliasPaths.map((path, i) =>
          i === index ? { ...path, mapperClass, mapperParameters: undefined } : path
        ),
      }));
    };

    const handleAddParameter = (index: number) => {
      const path = aliasForm.aliasPaths[index];

      // Initialize mapperParameters if not exists
      if (!path.mapperParameters) {
        setAliasForm((prev) => ({
          ...prev,
          aliasPaths: prev.aliasPaths.map((p, i) =>
            i === index
              ? {
                  ...p,
                  mapperParameters: {
                    '@bean': 'com.cyoda.core.reports.aliasmappers.SimpleTypeParameters',
                    parameters: {},
                  },
                }
              : p
          ),
        }));
      }

      setSelectedMapperRow({ index });
      mapperParametersDialogRef.current?.open();
    };

    const handleEditParameter = (index: number, paramName: string) => {
      const path = aliasForm.aliasPaths[index];
      const parameter = path.mapperParameters?.parameters[paramName];

      if (parameter) {
        setSelectedMapperRow({ index, paramName });
        mapperParametersDialogRef.current?.open(parameter);
      }
    };

    const handleRemoveParameter = (index: number, paramName: string) => {
      Modal.confirm({
        title: 'Confirm',
        content: 'Do you really want to remove this parameter?',
        onOk: () => {
          setAliasForm((prev) => ({
            ...prev,
            aliasPaths: prev.aliasPaths.map((path, i) => {
              if (i === index && path.mapperParameters?.parameters) {
                const newParams = { ...path.mapperParameters.parameters };
                delete newParams[paramName];
                return {
                  ...path,
                  mapperParameters: {
                    ...path.mapperParameters,
                    parameters: newParams,
                  },
                };
              }
              return path;
            }),
          }));
        },
      });
    };

    const handleParameterAdd = (parameter: NamedParameter) => {
      if (selectedMapperRow === null) return;

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: prev.aliasPaths.map((path, i) => {
          if (i === selectedMapperRow.index && path.mapperParameters) {
            return {
              ...path,
              mapperParameters: {
                ...path.mapperParameters,
                parameters: {
                  ...path.mapperParameters.parameters,
                  [parameter.name]: parameter,
                },
              },
            };
          }
          return path;
        }),
      }));
    };

    const handleParameterUpdate = (parameter: NamedParameter) => {
      if (selectedMapperRow === null) return;

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: prev.aliasPaths.map((path, i) => {
          if (i === selectedMapperRow.index && path.mapperParameters && parameter.oldName) {
            const newParams = { ...path.mapperParameters.parameters };
            delete newParams[parameter.oldName];
            const { oldName, ...newParam } = parameter;
            newParams[parameter.name] = newParam;

            return {
              ...path,
              mapperParameters: {
                ...path.mapperParameters,
                parameters: newParams,
              },
            };
          }
          return path;
        }),
      }));
    };

    const getMapperForPath = (colType: string): ReportMapper[] => {
      const key = colType.replace(/\./g, '_');
      return mappersByType[key] || [];
    };

    const isMapperParametrized = (mapperClass: string): boolean => {
      const mapper = allMappers.find((m) => m.mapperClass === mapperClass);
      return mapper?.parametrized || false;
    };

    const handleFinish = async () => {
      try {
        // Validate required fields
        if (!aliasForm.name || !aliasForm.entityClass) {
          message.error('Please fill in all required fields');
          return;
        }

        // Convert AliasPathLocal[] to AliasDefColDef[] (serialize mapperParameters if needed)
        const aliasPaths: AliasDefColDef[] = aliasForm.aliasPaths.map((path) => {
          // Filter out fieldType from colDef - server doesn't recognize it
          const { fieldType, ...cleanColDef } = path.colDef as any;

          return {
            colDef: cleanColDef,
            mapperClass: path.mapperClass,
            mapperParameters: typeof path.mapperParameters === 'object'
              ? JSON.stringify(path.mapperParameters)
              : path.mapperParameters,
          };
        });

        const aliasDef: AliasDef = {
          name: aliasForm.name,
          aliasType: aliasForm.aliasType,
          aliasPaths: {
            '@meta': 'com.cyoda.core.reports.columndefs.ReportAliasPathDef[]',
            value: aliasPaths,
          },
        };

        // Catalog mode - create/update catalog item via API
        if (aliasEditType === 'catalog' && (onCreate || onUpdate)) {
          const catalogItem: CatalogItem = {
            '@bean': 'com.cyoda.service.api.beans.AliasCatalogItemDto',
            name: aliasForm.name,
            desc: aliasForm.desc || '',
            entityClass: aliasForm.entityClass,
            aliasDef: aliasDef,
          };

          if (editItem?.id) {
            onUpdate?.(editItem.id, catalogItem);
          } else {
            onCreate?.(catalogItem);
          }

          // Also call report callbacks if provided (for adding to report after saving to catalog)
          if (editItem) {
            onUpdated?.(aliasDef);
          } else {
            onCreated?.(aliasDef);
          }

          setVisible(false);
        }
        // Report mode - just call callbacks (no API save)
        else {
          if (editItem) {
            onUpdated?.(aliasDef);
          } else {
            onCreated?.(aliasDef);
          }
          setVisible(false);
          message.success(editItem ? 'Alias updated successfully' : 'Alias created successfully');
        }
      } catch (error) {
        console.error('Error in handleFinish:', error);
        message.error('Failed to save alias');
      }
    };

    const pathColumns: TableColumnsType<AliasPathLocal> = [
      {
        title: 'Path',
        dataIndex: ['colDef', 'fullPath'],
        key: 'path',
      },
      {
        title: 'Mapper',
        key: 'mapper',
        width: 250,
        render: (_, record, index) => {
          const availableMappers = getMapperForPath(record.colDef.colType);
          return (
            <Select
              value={record.mapperClass}
              onChange={(value) => handleMapperChange(index, value)}
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              popupClassName="modelling-alias-new-dropdown"
              dropdownStyle={{ minWidth: '400px' }}
            >
              {availableMappers.map((m) => (
                <Select.Option key={m.mapperClass} value={m.mapperClass}>
                  {m.shortName}
                </Select.Option>
              ))}
            </Select>
          );
        },
      },
      {
        title: 'Parameters',
        key: 'parameters',
        width: 250,
        render: (_, record, index) => {
          const parametrized = isMapperParametrized(record.mapperClass);

          if (!parametrized) {
            return <span style={{ color: '#999' }}>Not possible</span>;
          }

          const parameters = record.mapperParameters?.parameters || {};
          const paramNames = Object.keys(parameters);

          return (
            <div>
              {paramNames.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {paramNames.map((name) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleEditParameter(index, name)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {name}
                      </Button>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveParameter(index, name)}
                        style={{ padding: 0, height: 'auto' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 180,
        render: (_, record, index) => (
          <Space size="small">
            <Tooltip title="Remove row">
              <Button danger icon={<DeleteOutlined />} onClick={() => handleRemovePath(index)} />
            </Tooltip>
            {isMapperParametrized(record.mapperClass) && (
              <Tooltip title="Add parameter">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddParameter(index)} />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    // Build steps array based on props
    const steps = [];

    // Entity step (catalog mode only)
    if (allowSelectEntity) {
      steps.push({
        title: 'Entity',
        content: (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Entity Class"
              name="entityClass"
              rules={[{ required: true, message: 'Please select an entity class' }]}
            >
              <Select
                showSearch
                placeholder="Select entity class"
                options={Array.isArray(entityClasses) ? entityClasses.map((ec) => ({
                  value: ec,
                  label: ec.split('.').pop(),
                })) : []}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => setAliasForm((prev) => ({ ...prev, entityClass: value }))}
                popupClassName="modelling-alias-new-dropdown"
                dropdownStyle={{ minWidth: '400px' }}
              />
            </Form.Item>
          </Form>
        ),
      });
    }

    // Paths step - different UI for catalog vs report mode
    // Paths step - tree view with checkboxes (same for both modes)
    steps.push({
      title: 'Paths',
      content: (
        <div>
          <div className="actions-settings" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <ModellingPopUpToggles onChange={handleTogglesChange} />
            <ModellingPopUpSearch onChange={handleSearchChange} />
          </div>
          {!aliasForm.entityClass ? (
            <Alert message="Please select an entity class first" type="info" showIcon />
          ) : (
            <div className="columns-list-wrapper">
              <Checkbox.Group
                value={selectedColumns.map(col => col.fullPath)}
                onChange={(checkedPaths) => {
                // Convert fullPaths back to ColDef objects
                const newColumns: ColDef[] = (checkedPaths as string[]).map(fullPath => {
                  // Try to find existing column to preserve all properties
                  const existing = selectedColumns.find(col => col.fullPath === fullPath);
                  if (existing) {
                    return existing;
                  }

                  // For new selections, get both field type and Java type from the checkbox element
                  const checkbox = document.querySelector(`input[type="checkbox"][value="${fullPath}"]`);
                  const fieldType = checkbox?.getAttribute('data-col-type') || 'LEAF';
                  const clazzType = checkbox?.getAttribute('data-clazz-type') || 'java.lang.String';

                  // Build the parts structure required by the server
                  const parts = {
                    '@meta': 'com.cyoda.core.reports.columndefs.ReportColPartDef[]',
                    value: [
                      {
                        rootClass: aliasForm.entityClass,
                        path: fullPath,
                        type: clazzType,
                      },
                    ],
                  };

                  return {
                    fullPath,
                    colType: clazzType,
                    parts,
                    fieldType, // Store field type separately for aliasType determination
                  } as any;
                });
                setSelectedColumns(newColumns);
              }}
            >
              {isVisibleGroup && (
                <ModellingGroup
                  reportInfoRows={reportingInfoRows}
                  relatedPaths={relatedPaths}
                  requestClass={aliasForm.entityClass}
                  checked={selectedColumns}
                  isOpenAllSelected={isOpenAllSelected}
                  isCondenseThePaths={isCondenseThePaths}
                  search={search}
                />
              )}
              </Checkbox.Group>
            </div>
          )}
        </div>
      ),
    });
    // Name step
    if (aliasEditType === 'catalog') {
      steps.push({
        title: 'Name',
        content: (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input Name' }]}
            >
              <Input
                placeholder="Enter alias name"
                onChange={(e) => {
                  const value = e.target.value.replaceAll('.', ':');
                  form.setFieldsValue({ name: value });
                  setAliasForm((prev) => ({ ...prev, name: value }));
                }}
              />
            </Form.Item>
            <Form.Item label="Description" name="desc">
              <Input.TextArea
                placeholder="Enter description"
                rows={3}
                onChange={(e) => setAliasForm((prev) => ({ ...prev, desc: e.target.value }))}
              />
            </Form.Item>
          </Form>
        ),
      });
    } else {
      steps.push({
        title: 'Name',
        content: (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Alias Name"
              name="name"
              rules={[{ required: true, message: 'Please enter alias name' }]}
            >
              <Input
                placeholder="Enter alias name"
                onChange={(e) => {
                  const value = e.target.value.replaceAll('.', ':');
                  form.setFieldsValue({ name: value });
                  setAliasForm((prev) => ({ ...prev, name: value }));
                }}
              />
            </Form.Item>
          </Form>
        ),
      });
    }

    // Mappers step
    steps.push({
      title: 'Mappers',
      content: (
        <div>
          <h2>Selected: {aliasForm.aliasPaths.length}</h2>
          <Table
            columns={pathColumns}
            dataSource={aliasForm.aliasPaths}
            rowKey={(record) => record.colDef.fullPath}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ),
    });

    // Config file step (catalog mode only)
    if (allowConfigFile) {
      // Define custom Neon Dark theme for Monaco Editor
      const handleEditorWillMount: BeforeMount = (monaco) => {
        monaco.editor.defineTheme('cyoda-neon-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            // Comments
            { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
            // Keywords - Neon Amber
            { token: 'keyword', foreground: 'F59E0B', fontStyle: 'bold' },
            { token: 'keyword.json', foreground: 'F59E0B' },
            // Strings - Neon Pink for keys, Neon Teal for values
            { token: 'string.key.json', foreground: 'EC4899' },
            { token: 'string.value.json', foreground: '14B8A6' },
            { token: 'string', foreground: '14B8A6' },
            // Numbers - Neon Amber
            { token: 'number', foreground: 'F59E0B' },
            // Delimiters - Neon Purple for {}, Neon Amber for []
            { token: 'delimiter.bracket.json', foreground: 'A78BFA' },
            { token: 'delimiter.array.json', foreground: 'F59E0B' },
            { token: 'delimiter', foreground: 'A8B5C8' },
          ],
          colors: {
            // Match header gradient color - using top color from header
            'editor.background': '#1a2332',
            'editor.foreground': '#E0E0E0',
            'editorLineNumber.foreground': '#6B7280',
            'editorLineNumber.activeForeground': '#14b8a6',
            'editor.lineHighlightBackground': '#1e293b',
            'editor.selectionBackground': '#14b8a633',
            'editor.inactiveSelectionBackground': '#14b8a622',
            'editorCursor.foreground': '#14b8a6',
            'editorWhitespace.foreground': '#374151',
            'editorIndentGuide.background': '#374151',
            'editorIndentGuide.activeBackground': '#4B5563',
            'scrollbar.shadow': '#00000000',
            'scrollbarSlider.background': '#374151',
            'scrollbarSlider.hoverBackground': '#4B5563',
            'scrollbarSlider.activeBackground': '#14b8a6',
          },
        });
      };

      steps.push({
        title: 'Config file',
        content: (
          <div>
            <p style={{ marginBottom: 16 }}>Review and edit the alias configuration:</p>
            <MonacoEditor
              height="400px"
              language="json"
              theme="cyoda-neon-dark"
              value={JSON.stringify(
                {
                  '@bean': 'com.cyoda.core.model.catalog.AliasCatalogItem',
                  name: aliasForm.name,
                  desc: aliasForm.desc || '',
                  entityClass: aliasForm.entityClass,
                  aliasDef: {
                    name: aliasForm.name,
                    aliasType: aliasForm.aliasType,
                    aliasPaths: {
                      '@meta': 'com.cyoda.core.reports.columndefs.ReportAliasPathDef[]',
                      value: aliasForm.aliasPaths,
                    },
                  },
                },
                null,
                2
              )}
              beforeMount={handleEditorWillMount}
              options={{
                readOnly: true,
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace",
                fontSize: 14,
                lineHeight: 22,
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: false,
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        ),
      });
    }

    return (
      <>
        <Modal
          title={aliasEditType === 'catalog' ? 'Columns' : (editItem ? 'Edit Alias' : 'Create New Alias')}
          open={visible}
          onCancel={() => setVisible(false)}
          width={aliasEditType === 'catalog' ? '90%' : '80%'}
          footer={null}
          className="modelling-popup-alias-new"
        >
          <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

          <div style={{ minHeight: 300 }}>{steps[currentStep]?.content}</div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>Previous</Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleFinish}
                  disabled={aliasForm.aliasPaths.length === 0}
                >
                  {editItem ? 'Update' : 'Create'}
                </Button>
              )}
            </Space>
          </div>
        </Modal>

        <MapperParametersDialog
          ref={mapperParametersDialogRef}
          onAdd={handleParameterAdd}
          onUpdate={handleParameterUpdate}
        />
      </>
    );
  }
);

ModellingPopUpAliasNew.displayName = 'ModellingPopUpAliasNew';

export default ModellingPopUpAliasNew;

