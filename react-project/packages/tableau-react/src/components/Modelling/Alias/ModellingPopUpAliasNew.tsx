/**
 * ModellingPopUpAliasNew Component
 * Create/Edit alias dialog with mapper configuration
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue
 */

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Table, Space, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ReportMapper, NamedParameter, MapperParameters } from '@cyoda/http-api-react';
import { getMappers } from '@cyoda/http-api-react';
import { ModellingPopUp, ModellingPopUpRef } from '../ModellingPopUp';
import MapperParametersDialog, { MapperParametersDialogRef } from '../../MapperParametersDialog';
import type { ColDef, ReportDefinition, AliasDef } from '../../../types';
import './ModellingPopUpAliasNew.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ModellingPopUpAliasNewProps {
  configDefinition: ReportDefinition;
  onCreated?: (aliasDef: AliasDef) => void;
  onUpdated?: () => void;
}

export interface ModellingPopUpAliasNewRef {
  open: (requestClass: string, editItem?: any) => void;
  close: () => void;
}

interface AliasPath {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: MapperParameters;
}

interface AliasForm {
  name: string;
  aliasType: string;
  entityClass: string;
  aliasPaths: AliasPath[];
}

export const ModellingPopUpAliasNew = forwardRef<ModellingPopUpAliasNewRef, ModellingPopUpAliasNewProps>(
  ({ configDefinition, onCreated, onUpdated }, ref) => {
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [aliasForm, setAliasForm] = useState<AliasForm>({
      name: '',
      aliasType: 'SIMPLE',
      entityClass: '',
      aliasPaths: [],
    });
    const [editItem, setEditItem] = useState<any>(null);
    const [selectedColumns, setSelectedColumns] = useState<ColDef[]>([]);
    const modellingPopUpRef = useRef<ModellingPopUpRef>(null);
    const mapperParametersDialogRef = useRef<MapperParametersDialogRef>(null);
    const [selectedMapperRow, setSelectedMapperRow] = useState<{ index: number; paramName?: string } | null>(null);

    useImperativeHandle(ref, () => ({
      open: (requestClass: string, item?: any) => {
        setVisible(true);
        setCurrentStep(0);
        setEditItem(item || null);
        
        if (item) {
          // Edit mode
          const paths = item.aliasDef.aliasPaths?.value || [];
          setAliasForm({
            name: item.aliasDef.name,
            aliasType: item.aliasDef.aliasType || 'SIMPLE',
            entityClass: requestClass,
            aliasPaths: paths,
          });
          setSelectedColumns(paths.map((p: any) => p.colDef));
          form.setFieldsValue({
            name: item.aliasDef.name,
            aliasType: item.aliasDef.aliasType || 'SIMPLE',
          });
        } else {
          // Create mode
          setAliasForm({
            name: '',
            aliasType: 'SIMPLE',
            entityClass: requestClass,
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
        const { data } = await getMappers();
        return data;
      },
    });

    // Fetch mappers by type for each path
    const [mappersByType, setMappersByType] = useState<{ [key: string]: ReportMapper[] }>({});

    // Load mappers by type when paths change
    useEffect(() => {
      if (aliasForm.aliasPaths.length > 0 && currentStep === 3) {
        loadMappersByTypes();
      }
    }, [aliasForm.aliasPaths, currentStep]);

    const loadMappersByTypes = async () => {
      try {
        const uniqueTypes = Array.from(new Set(aliasForm.aliasPaths.map((p) => p.colDef.colType)));
        const results = await Promise.all(
          uniqueTypes.map((type) => getMappers({ inClass: type }))
        );

        const mappersByTypeObj: { [key: string]: ReportMapper[] } = {};
        uniqueTypes.forEach((type, index) => {
          const key = type.replace(/\./g, '_');
          mappersByTypeObj[key] = results[index].data;
        });

        setMappersByType(mappersByTypeObj);
      } catch (error) {
        console.error('Failed to load mappers by type:', error);
      }
    };

    // Create/Update mutation
    const saveMutation = useMutation({
      mutationFn: async (payload: { catalogItem: any; aliasDef: AliasDef }) => {
        if (editItem?.id) {
          const { data } = await axios.put(
            `${API_BASE}/platform-api/catalog/item?itemId=${editItem.id}`,
            payload.catalogItem
          );
          return { data, aliasDef: payload.aliasDef };
        } else {
          const { data } = await axios.post(`${API_BASE}/platform-api/catalog/item`, payload.catalogItem);
          return { data, aliasDef: payload.aliasDef };
        }
      },
      onSuccess: (result) => {
        message.success(editItem ? 'Alias updated successfully' : 'Alias created successfully');
        setVisible(false);
        if (editItem) {
          onUpdated?.();
        } else {
          onCreated?.(result.aliasDef);
        }
      },
      onError: () => {
        message.error('Failed to save alias');
      },
    });

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

    const handleAddColumns = () => {
      modellingPopUpRef.current?.open();
    };

    const handleColumnsSelected = (columns: ColDef[]) => {
      const newPaths = columns.map((col) => {
        // Find existing mapper if editing
        const existingPath = editItem?.aliasDef?.aliasPaths?.value?.find(
          (p: any) => p.colDef.fullPath === col.fullPath
        );

        return {
          colDef: col,
          mapperClass: existingPath?.mapperClass || 'com.cyoda.core.reports.aliasmappers.BasicMapper',
          mapperParameters: existingPath?.mapperParameters,
        };
      });

      const allPaths = [...aliasForm.aliasPaths, ...newPaths];
      const allColumns = [...selectedColumns, ...columns];

      // Auto-detect alias type from first column's colType
      const aliasType = allColumns.length > 0 ? allColumns[0].colType : 'SIMPLE';

      // Auto-generate name from first column if name is empty
      let autoName = aliasForm.name;
      if (!autoName && allColumns.length > 0) {
        const firstPath = allColumns[0].fullPath;
        const shortPath = firstPath.split('.').pop() || firstPath;
        autoName = shortPath.replaceAll('.', ':');
      }

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: allPaths,
        aliasType: aliasType as 'SIMPLE' | 'COMPLEX',
        name: autoName,
      }));

      setSelectedColumns(allColumns);

      // Update form field
      if (autoName && !form.getFieldValue('name')) {
        form.setFieldsValue({ name: autoName });
      }
    };

    const handleRemovePath = (index: number) => {
      const newPaths = aliasForm.aliasPaths.filter((_, i) => i !== index);
      const newColumns = selectedColumns.filter((_, i) => i !== index);

      // Update alias type based on remaining columns
      const aliasType = newColumns.length > 0 ? newColumns[0].colType : 'SIMPLE';

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
      const aliasDef: AliasDef = {
        name: aliasForm.name,
        aliasType: aliasForm.aliasType,
        aliasPaths: {
          '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
          value: aliasForm.aliasPaths,
        },
      };

      const catalogItem = {
        name: aliasForm.name,
        aliasDef: aliasDef,
      };

      await saveMutation.mutateAsync({ catalogItem, aliasDef });
    };

    const pathColumns: TableColumnsType<AliasPath> = [
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

    const steps = [
      {
        title: 'Paths',
        content: (
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddColumns}
              style={{ marginBottom: 16 }}
            >
              Add Columns
            </Button>
            {aliasForm.aliasPaths.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Selected Paths:</strong> {aliasForm.aliasPaths.length}
                {aliasForm.aliasType && (
                  <span style={{ marginLeft: 16 }}>
                    <strong>Type:</strong> {aliasForm.aliasType}
                  </span>
                )}
              </div>
            )}
            <Table
              columns={[
                {
                  title: 'Path',
                  dataIndex: ['colDef', 'fullPath'],
                  key: 'path',
                },
                {
                  title: 'Type',
                  dataIndex: ['colDef', 'colType'],
                  key: 'type',
                },
                {
                  title: 'Action',
                  key: 'action',
                  width: 100,
                  render: (_, record, index) => (
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleRemovePath(index)} />
                  ),
                },
              ]}
              dataSource={aliasForm.aliasPaths}
              rowKey={(record, index) => `${record.colDef.fullPath}-${index}`}
              pagination={false}
            />
          </div>
        ),
      },
      {
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
            <Form.Item label="Alias Type (Auto-detected)">
              <Input value={aliasForm.aliasType} disabled />
            </Form.Item>
          </Form>
        ),
      },
      {
        title: 'Mappers',
        content: (
          <div>
            <h2>Selected: {aliasForm.aliasPaths.length}</h2>
            <Table
              columns={pathColumns}
              dataSource={aliasForm.aliasPaths}
              rowKey={(record, index) => `${record.colDef.fullPath}-${index}`}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        ),
      },
    ];

    return (
      <>
        <Modal
          title={editItem ? 'Edit Alias' : 'Create New Alias'}
          open={visible}
          onCancel={() => setVisible(false)}
          width="80%"
          footer={null}
        >
          <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

          <div style={{ minHeight: 300 }}>{steps[currentStep].content}</div>

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
                  loading={saveMutation.isPending}
                  disabled={aliasForm.aliasPaths.length === 0}
                >
                  {editItem ? 'Update' : 'Create'}
                </Button>
              )}
            </Space>
          </div>
        </Modal>

        <ModellingPopUp
          ref={modellingPopUpRef}
          requestClass={aliasForm.entityClass}
          checked={selectedColumns}
          onChange={handleColumnsSelected}
        />

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

