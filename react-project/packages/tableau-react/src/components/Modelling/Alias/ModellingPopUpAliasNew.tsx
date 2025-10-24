/**
 * ModellingPopUpAliasNew Component
 * Create/Edit alias dialog with mapper configuration
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue
 */

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Table, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ModellingPopUp, ModellingPopUpRef } from '../ModellingPopUp';
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
  mapperParameters?: string;
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

    // Fetch available mappers
    const { data: mappers = [] } = useQuery({
      queryKey: ['mappers'],
      queryFn: async () => {
        const { data } = await axios.get(`${API_BASE}/platform-api/catalog/mappers`);
        return data as string[];
      },
    });

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
          i === index ? { ...path, mapperClass } : path
        ),
      }));
    };

    const handleParametersChange = (index: number, parameters: string) => {
      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: prev.aliasPaths.map((path, i) =>
          i === index ? { ...path, mapperParameters: parameters } : path
        ),
      }));
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
        dataIndex: 'mapperClass',
        key: 'mapper',
        render: (mapperClass: string, record, index) => (
          <Select
            value={mapperClass}
            onChange={(value) => handleMapperChange(index, value)}
            style={{ width: '100%' }}
          >
            {mappers.map((mapper) => (
              <Select.Option key={mapper} value={mapper}>
                {mapper.split('.').pop()}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        title: 'Parameters',
        dataIndex: 'mapperParameters',
        key: 'parameters',
        render: (parameters: string | undefined, record, index) => (
          <Input
            value={parameters || ''}
            onChange={(e) => handleParametersChange(index, e.target.value)}
            placeholder="Optional parameters"
          />
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (_, record, index) => (
          <Button danger icon={<DeleteOutlined />} onClick={() => handleRemovePath(index)} />
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
            <p>Configure mapper classes and parameters for each path:</p>
            <Table
              columns={pathColumns}
              dataSource={aliasForm.aliasPaths}
              rowKey={(record, index) => `${record.colDef.fullPath}-${index}`}
              pagination={false}
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
      </>
    );
  }
);

ModellingPopUpAliasNew.displayName = 'ModellingPopUpAliasNew';

export default ModellingPopUpAliasNew;

