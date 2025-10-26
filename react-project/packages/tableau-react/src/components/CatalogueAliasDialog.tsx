/**
 * Catalogue Alias Dialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue
 * 
 * Dialog for creating and editing alias catalog items
 */

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Table, Space, message, Checkbox, Alert, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import type { CatalogItem, AliasDef, ColDef, ReportMapper, NamedParameter, MapperParameters } from '@cyoda/http-api-react';
import { getMappers } from '@cyoda/http-api-react';
import { ModellingPopUpToggles } from './Modelling/ModellingPopUpToggles';
import { ModellingPopUpSearch } from './Modelling/ModellingPopUpSearch';
import { ModellingGroup } from './Modelling/ModellingGroup';
import MapperParametersDialog, { MapperParametersDialogRef } from './MapperParametersDialog';
import type { ReportingInfoRow, RelatedPath } from '../types/modelling';
import { getReportingInfo, getReportingRelatedPaths } from '../api/modelling';
import HelperModelling from '../utils/HelperModelling';
import './CatalogueAliasDialog.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface CatalogueAliasDialogProps {
  onCreate: (item: CatalogItem) => void;
  onUpdate: (id: string, item: CatalogItem) => void;
}

export interface CatalogueAliasDialogRef {
  open: (editItem?: CatalogItem) => void;
  close: () => void;
}

interface AliasPath {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: MapperParameters;
}

interface AliasForm {
  name: string;
  desc: string;
  entityClass: string;
  aliasType: string;
  aliasPaths: AliasPath[];
}

export const CatalogueAliasDialog = forwardRef<CatalogueAliasDialogRef, CatalogueAliasDialogProps>(
  ({ onCreate, onUpdate }, ref) => {
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [aliasForm, setAliasForm] = useState<AliasForm>({
      name: '',
      desc: '',
      entityClass: '',
      aliasType: 'SIMPLE',
      aliasPaths: [],
    });
    const [editItem, setEditItem] = useState<CatalogItem | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<ColDef[]>([]);
    const mapperParametersDialogRef = useRef<MapperParametersDialogRef>(null);
    const [selectedMapperRow, setSelectedMapperRow] = useState<{ index: number; paramName?: string } | null>(null);

    // State for inline tree view in Paths step
    const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);
    const [relatedPaths, setRelatedPaths] = useState<RelatedPath[]>([]);
    const [isVisibleGroup, setIsVisibleGroup] = useState(false);
    const [isOpenAllSelected, setIsOpenAllSelected] = useState(false);
    const [isCondenseThePaths, setIsCondenseThePaths] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch entity classes
    const { data: entityClasses = [] } = useQuery({
      queryKey: ['entityClasses'],
      queryFn: async () => {
        const { data } = await axios.get<string[]>(`${API_BASE}/platform-api/entity/classes`);
        return data;
      },
    });

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

    // Load entity model when entity class changes
    useEffect(() => {
      if (aliasForm.entityClass && currentStep === 1) {
        loadEntityModel();
      }
    }, [aliasForm.entityClass, currentStep]);

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

    const loadEntityModel = async () => {
      try {
        const [infoResponse, relatedResponse] = await Promise.all([
          getReportingInfo(aliasForm.entityClass),
          getReportingRelatedPaths(aliasForm.entityClass),
        ]);
        setReportingInfoRows(infoResponse.data);
        setRelatedPaths(relatedResponse.data);
        setIsVisibleGroup(true);
      } catch (error) {
        console.error('Failed to load entity model:', error);
        message.error('Failed to load entity model');
      }
    };

    const handleTogglesChange = (values: { isCondenseThePaths: boolean; isOpenAllSelected: boolean }) => {
      setIsCondenseThePaths(values.isCondenseThePaths);
      setIsOpenAllSelected(values.isOpenAllSelected);
    };

    const handleSearchChange = (values: { input: string }) => {
      setSearch(values.input);
    };

    useImperativeHandle(ref, () => ({
      open: (item?: CatalogItem) => {
        setVisible(true);
        setCurrentStep(0);
        setEditItem(item || null);

        if (item) {
          // Edit mode
          console.log('🔧 Opening edit mode for item:', item);
          const paths = item.aliasDef.aliasPaths?.value || [];
          console.log('📋 Paths from alias:', paths);

          const columns = paths.map((p: any) => p.colDef);
          console.log('✅ Selected columns:', columns);

          setAliasForm({
            name: item.name,
            desc: item.desc || '',
            entityClass: item.entityClass,
            aliasType: item.aliasDef.aliasType || 'SIMPLE',
            aliasPaths: paths,
          });
          setSelectedColumns(columns);
          form.setFieldsValue({
            name: item.name,
            desc: item.desc,
            entityClass: item.entityClass,
            aliasType: item.aliasDef.aliasType || 'SIMPLE',
          });
        } else {
          // Create mode
          setAliasForm({
            name: '',
            desc: '',
            entityClass: '',
            aliasType: 'SIMPLE',
            aliasPaths: [],
          });
          setSelectedColumns([]);
          form.resetFields();
        }
      },
      close: () => setVisible(false),
    }));

    const handleNext = async () => {
      try {
        if (currentStep === 0) {
          // Validate entity selection
          await form.validateFields(['entityClass']);
        } else if (currentStep === 1) {
          // Validate paths
          if (aliasForm.aliasPaths.length === 0) {
            message.error('Please select at least one path');
            return;
          }
        } else if (currentStep === 2) {
          // Validate name
          await form.validateFields(['name', 'desc']);
        }

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

    // Watch selectedColumns and update aliasPaths
    useEffect(() => {
      if (selectedColumns.length === 0) return;

      // Create alias paths from selected columns
      const newPaths: AliasPath[] = selectedColumns.map((col) => {
        // Try to preserve existing mapper settings if the column was already selected
        const existingPath = aliasForm.aliasPaths.find((p) => p.colDef.fullPath === col.fullPath);

        return {
          colDef: col,
          mapperClass: existingPath?.mapperClass || 'com.cyoda.core.reports.aliasmappers.BasicMapper',
          mapperParameters: existingPath?.mapperParameters,
        };
      });

      // Auto-detect alias type from first column's colType
      const aliasType = selectedColumns.length > 0 ? selectedColumns[0].colType : 'SIMPLE';

      // Auto-generate name from first column if name is empty
      let autoName = aliasForm.name;
      if (!autoName && selectedColumns.length > 0) {
        const firstPath = selectedColumns[0].fullPath;
        const shortPath = firstPath.split('.').pop() || firstPath;
        autoName = shortPath.replaceAll('.', ':');
      }

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: newPaths,
        aliasType: aliasType as 'SIMPLE' | 'COMPLEX',
        name: autoName,
      }));

      // Update form field
      if (autoName && !form.getFieldValue('name')) {
        form.setFieldsValue({ name: autoName });
      }
    }, [selectedColumns]);

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
      const newPaths = [...aliasForm.aliasPaths];
      // Clear parameters when mapper changes
      newPaths[index] = {
        ...newPaths[index],
        mapperClass,
        mapperParameters: undefined,
      };
      setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
    };

    const handleAddParameter = (index: number) => {
      const path = aliasForm.aliasPaths[index];

      // Initialize mapperParameters if not exists
      if (!path.mapperParameters) {
        const newPaths = [...aliasForm.aliasPaths];
        newPaths[index] = {
          ...newPaths[index],
          mapperParameters: {
            '@bean': 'com.cyoda.core.reports.aliasmappers.SimpleTypeParameters',
            parameters: {},
          },
        };
        setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
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
          const newPaths = [...aliasForm.aliasPaths];
          if (newPaths[index].mapperParameters?.parameters) {
            delete newPaths[index].mapperParameters!.parameters[paramName];
            setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
          }
        },
      });
    };

    const handleParameterAdd = (parameter: NamedParameter) => {
      if (selectedMapperRow === null) return;

      const newPaths = [...aliasForm.aliasPaths];
      const path = newPaths[selectedMapperRow.index];

      if (path.mapperParameters) {
        path.mapperParameters.parameters[parameter.name] = parameter;
        setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
      }
    };

    const handleParameterUpdate = (parameter: NamedParameter) => {
      if (selectedMapperRow === null) return;

      const newPaths = [...aliasForm.aliasPaths];
      const path = newPaths[selectedMapperRow.index];

      if (path.mapperParameters && parameter.oldName) {
        // Remove old parameter
        delete path.mapperParameters.parameters[parameter.oldName];
        // Add updated parameter
        const { oldName, ...newParam } = parameter;
        path.mapperParameters.parameters[parameter.name] = newParam;
        setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
      }
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
        console.log('🔍 aliasForm state:', aliasForm);

        // Validate that we have the required fields
        if (!aliasForm.name || !aliasForm.entityClass) {
          console.error('❌ Missing required fields:', { name: aliasForm.name, entityClass: aliasForm.entityClass });
          message.error('Please fill in all required fields');
          return;
        }

        const aliasDef: AliasDef = {
          name: aliasForm.name,
          aliasType: aliasForm.aliasType,
          aliasPaths: {
            '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
            value: aliasForm.aliasPaths,
          },
        };

        const catalogItem: CatalogItem = {
          '@bean': 'com.cyoda.core.model.catalog.AliasCatalogItem',
          name: aliasForm.name,
          desc: aliasForm.desc || '',
          entityClass: aliasForm.entityClass,
          aliasDef: aliasDef,
        };

        console.log('📤 Sending catalog item:', catalogItem);

        if (editItem?.id) {
          onUpdate(editItem.id, catalogItem);
        } else {
          onCreate(catalogItem);
        }

        setVisible(false);
      } catch (error) {
        console.error('❌ Error in handleFinish:', error);
        message.error('Please fill in all required fields');
      }
    };

    // Table columns for mappers step
    const mapperColumns: TableColumnsType<AliasPath> = [
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
                options={entityClasses.map((ec) => ({
                  value: ec,
                  label: ec.split('.').pop(),
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => setAliasForm((prev) => ({ ...prev, entityClass: value }))}
              />
            </Form.Item>
          </Form>
        ),
      },
      {
        title: 'Paths',
        content: (
          <div>
            <div className="actions-settings" style={{ marginBottom: 16 }}>
              <ModellingPopUpToggles onChange={handleTogglesChange} />
              <ModellingPopUpSearch onChange={handleSearchChange} />
            </div>
            {!aliasForm.entityClass ? (
              <Alert message="Please select an entity class first" type="info" showIcon />
            ) : (
              <Checkbox.Group
                value={selectedColumns.map(col => col.fullPath)}
                onChange={(checkedPaths) => {
                  console.log('📝 Checkbox.Group onChange:', checkedPaths);
                  // Convert fullPaths back to ColDef objects
                  const newColumns: ColDef[] = (checkedPaths as string[]).map(fullPath => {
                    // Try to find existing column to preserve all properties
                    const existing = selectedColumns.find(col => col.fullPath === fullPath);
                    if (existing) {
                      return existing;
                    }

                    // For new selections, try to find the colType from the checkbox element
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${fullPath}"]`);
                    const colType = checkbox?.getAttribute('data-col-type') || 'LEAF';

                    return {
                      fullPath,
                      colType,
                    } as ColDef;
                  });
                  console.log('✅ New selected columns:', newColumns);
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
            )}
          </div>
        ),
      },
      {
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
      },
      {
        title: 'Mappers',
        content: (
          <div>
            <h2>Selected: {aliasForm.aliasPaths.length}</h2>
            <Table
              columns={mapperColumns}
              dataSource={aliasForm.aliasPaths}
              rowKey={(record, index) => `${record.colDef.fullPath}-${index}`}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        ),
      },
      {
        title: 'Config file',
        content: (
          <div>
            <p style={{ marginBottom: 16 }}>Review and edit the alias configuration:</p>
            <MonacoEditor
              height="400px"
              language="json"
              theme="vs-light"
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
                      '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
                      value: aliasForm.aliasPaths,
                    },
                  },
                },
                null,
                2
              )}
              onChange={(value) => {
                if (!value) return;
                try {
                  const parsed = JSON.parse(value);
                  setAliasForm({
                    name: parsed.name || '',
                    desc: parsed.desc || '',
                    entityClass: parsed.entityClass || '',
                    aliasType: parsed.aliasDef?.aliasType || 'SIMPLE',
                    aliasPaths: parsed.aliasDef?.aliasPaths?.value || [],
                  });
                  form.setFieldsValue({
                    name: parsed.name || '',
                    desc: parsed.desc || '',
                  });
                } catch (e) {
                  // Invalid JSON, ignore
                }
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: 'on',
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
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
          width="90%"
          footer={null}
        >
          <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

          <div style={{ minHeight: 300 }}>{steps[currentStep].content}</div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && <Button onClick={handlePrev}>Previous</Button>}
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

CatalogueAliasDialog.displayName = 'CatalogueAliasDialog';

export default CatalogueAliasDialog;

