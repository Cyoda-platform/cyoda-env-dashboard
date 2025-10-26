/**
 * Catalogue Alias Dialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAliasNew.vue
 * 
 * Dialog for creating and editing alias catalog items
 */

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Table, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { CatalogItem, AliasDef, ColDef } from '@cyoda/http-api-react';
import { ModellingPopUp, ModellingPopUpRef } from './Modelling/ModellingPopUp';
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
  mapperParameters?: string;
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
    const modellingPopUpRef = useRef<ModellingPopUpRef>(null);

    // Fetch entity classes
    const { data: entityClasses = [] } = useQuery({
      queryKey: ['entityClasses'],
      queryFn: async () => {
        const { data } = await axios.get<string[]>(`${API_BASE}/platform-api/entity/classes`);
        return data;
      },
    });

    // Fetch available mappers
    const { data: mappers = [] } = useQuery({
      queryKey: ['mappers'],
      queryFn: async () => {
        const { data } = await axios.get<string[]>(`${API_BASE}/platform-api/catalog/mappers`);
        return data;
      },
    });

    useImperativeHandle(ref, () => ({
      open: (item?: CatalogItem) => {
        setVisible(true);
        setCurrentStep(0);
        setEditItem(item || null);

        if (item) {
          // Edit mode
          const paths = item.aliasDef.aliasPaths?.value || [];
          setAliasForm({
            name: item.name,
            desc: item.desc || '',
            entityClass: item.entityClass,
            aliasType: item.aliasDef.aliasType || 'SIMPLE',
            aliasPaths: paths,
          });
          setSelectedColumns(paths.map((p: any) => p.colDef));
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

    const handleAddColumns = () => {
      if (!aliasForm.entityClass) {
        message.error('Please select an entity class first');
        return;
      }
      modellingPopUpRef.current?.open();
    };

    const handleColumnsSelected = (columns: ColDef[]) => {
      // Create new alias paths with default mapper
      const newPaths: AliasPath[] = columns.map((col) => ({
        colDef: col,
        mapperClass: 'com.cyoda.core.reports.mappers.SimpleMapper',
        mapperParameters: undefined,
      }));

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
      const newPaths = [...aliasForm.aliasPaths];
      newPaths[index] = { ...newPaths[index], mapperClass };
      setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
    };

    const handleMapperParametersChange = (index: number, mapperParameters: string) => {
      const newPaths = [...aliasForm.aliasPaths];
      newPaths[index] = { ...newPaths[index], mapperParameters };
      setAliasForm((prev) => ({ ...prev, aliasPaths: newPaths }));
    };

    const handleFinish = async () => {
      try {
        await form.validateFields();
        const values = form.getFieldsValue();

        const aliasDef: AliasDef = {
          name: values.name,
          aliasType: aliasForm.aliasType,
          aliasPaths: {
            '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
            value: aliasForm.aliasPaths,
          },
        };

        const catalogItem: CatalogItem = {
          '@bean': 'com.cyoda.core.model.catalog.AliasCatalogItem',
          name: values.name,
          desc: values.desc || '',
          entityClass: values.entityClass,
          aliasDef: aliasDef,
        };

        if (editItem?.id) {
          onUpdate(editItem.id, catalogItem);
        } else {
          onCreate(catalogItem);
        }

        setVisible(false);
      } catch (error) {
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
        title: 'Type',
        dataIndex: ['colDef', 'colType'],
        key: 'type',
        width: 100,
      },
      {
        title: 'Mapper',
        key: 'mapper',
        width: 250,
        render: (_, record, index) => (
          <Select
            value={record.mapperClass}
            onChange={(value) => handleMapperChange(index, value)}
            style={{ width: '100%' }}
            options={mappers.map((m) => ({
              value: m,
              label: m.split('.').pop(),
            }))}
          />
        ),
      },
      {
        title: 'Parameters',
        key: 'parameters',
        width: 150,
        render: (_, record, index) => (
          <Input
            value={record.mapperParameters}
            onChange={(e) => handleMapperParametersChange(index, e.target.value)}
            placeholder="Optional"
          />
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (_, record, index) => (
          <Button danger icon={<DeleteOutlined />} onClick={() => handleRemovePath(index)} />
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
            <Form.Item label="Description" name="desc">
              <Input.TextArea
                placeholder="Enter description"
                rows={3}
                onChange={(e) => setAliasForm((prev) => ({ ...prev, desc: e.target.value }))}
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
            <p>Configure mappers for each path:</p>
            <Table
              columns={mapperColumns}
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

CatalogueAliasDialog.displayName = 'CatalogueAliasDialog';

export default CatalogueAliasDialog;

