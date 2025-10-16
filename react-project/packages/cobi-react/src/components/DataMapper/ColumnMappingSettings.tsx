import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Divider } from 'antd';
import TransformerConfig from './TransformerConfig';
import type { ColumnMappingConfigDto } from '../../types';
import './ColumnMappingSettings.css';

interface ColumnMappingSettingsProps {
  visible: boolean;
  columnMapping: ColumnMappingConfigDto | null;
  sourceData?: any;
  onSave: (columnMapping: ColumnMappingConfigDto) => void;
  onCancel: () => void;
}

const ColumnMappingSettings: React.FC<ColumnMappingSettingsProps> = ({
  visible,
  columnMapping,
  sourceData,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [localMapping, setLocalMapping] = useState<ColumnMappingConfigDto | null>(null);

  useEffect(() => {
    if (columnMapping) {
      setLocalMapping({ ...columnMapping });
      form.setFieldsValue({
        srcColumnPath: columnMapping.srcColumnPath,
        dstCyodaColumnPath: columnMapping.dstCyodaColumnPath,
      });
    }
  }, [columnMapping, form]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      if (localMapping) {
        onSave(localMapping);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleTransformerChange = (transformer: any) => {
    if (localMapping) {
      setLocalMapping({
        ...localMapping,
        transformer,
      });
    }
  };

  if (!localMapping) return null;

  return (
    <Modal
      title="Column Mapping Settings"
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={800}
      className="column-mapping-settings-modal"
    >
      <div className="column-mapping-settings">
        <Form form={form} layout="vertical">
          <Form.Item
            label="Source Column Path"
            name="srcColumnPath"
            rules={[{ required: true, message: 'Please enter source column path' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Target Column Path"
            name="dstCyodaColumnPath"
            rules={[{ required: true, message: 'Please enter target column path' }]}
          >
            <Input disabled />
          </Form.Item>
        </Form>

        <Divider>Transformers</Divider>

        <TransformerConfig
          transformer={localMapping.transformer}
          columnMapping={localMapping}
          sourceData={sourceData}
          onChange={handleTransformerChange}
        />
      </div>
    </Modal>
  );
};

export default ColumnMappingSettings;

