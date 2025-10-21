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
  onCreated?: () => void;
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
      mutationFn: async (alias: any) => {
        if (editItem?.id) {
          const { data } = await axios.put(
            `${API_BASE}/platform-api/catalog/item?itemId=${editItem.id}`,
            alias
          );
          return data;
        } else {
          const { data } = await axios.post(`${API_BASE}/platform-api/catalog/item`, alias);
          return data;
        }
      },
      onSuccess: () => {
        message.success(editItem ? 'Alias updated successfully' : 'Alias created successfully');
        setVisible(false);
        if (editItem) {
          onUpdated?.();
        } else {
          onCreated?.();
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
      const newPaths = columns.map((col) => ({
        colDef: col,
        mapperClass: 'com.cyoda.platform.mappers.IdentityMapper',
        mapperParameters: undefined,
      }));

      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: [...prev.aliasPaths, ...newPaths],
      }));
      setSelectedColumns([...selectedColumns, ...columns]);
    };

    const handleRemovePath = (index: number) => {
      setAliasForm((prev) => ({
        ...prev,
        aliasPaths: prev.aliasPaths.filter((_, i) => i !== index),
      }));
      setSelectedColumns(selectedColumns.filter((_, i) => i !== index));
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
      const catalogItem = {
        name: aliasForm.name,
        aliasDef: {
          name: aliasForm.name,
          aliasType: aliasForm.aliasType,
          aliasPaths: {
            '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
            value: aliasForm.aliasPaths,
          },
        },
      };

      await saveMutation.mutateAsync(catalogItem);
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
        title: 'Basic Info',
        content: (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Alias Name"
              name="name"
              rules={[{ required: true, message: 'Please enter alias name' }]}
            >
              <Input placeholder="Enter alias name" />
            </Form.Item>
            <Form.Item label="Alias Type" name="aliasType" initialValue="SIMPLE">
              <Select>
                <Select.Option value="SIMPLE">Simple</Select.Option>
                <Select.Option value="COMPLEX">Complex</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        ),
      },
      {
        title: 'Select Columns',
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

