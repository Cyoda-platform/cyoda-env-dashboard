import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Select, Button, message } from 'antd';

const { Option } = Select;

export interface DryRunSettingsDialogRef {
  open: () => void;
}

interface DryRunSettingsDialogProps {
  onSave?: (settings: DryRunSettings) => void;
}

export interface DryRunSettings {
  defaultLevel: string;
  commonLevel: string;
  parserLevel: string;
  transformerLevel: string;
  entityCreatorLevel: string;
  columnMappingLevel: string;
  functionalMappingLevel: string;
}

const LOG_LEVELS = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

const DEFAULT_SETTINGS: DryRunSettings = {
  defaultLevel: 'INFO',
  commonLevel: 'INFO',
  parserLevel: 'INFO',
  transformerLevel: 'INFO',
  entityCreatorLevel: 'INFO',
  columnMappingLevel: 'INFO',
  functionalMappingLevel: 'INFO',
};

const STORAGE_KEY = 'dryRunSettings';

const DryRunSettingsDialog = forwardRef<DryRunSettingsDialogRef, DryRunSettingsDialogProps>(
  ({ onSave }, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      open: () => {
        loadSettings();
        setVisible(true);
      },
    }));

    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const settings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        form.setFieldsValue(settings);
      } catch (error) {
        console.error('Failed to load dry run settings:', error);
        form.setFieldsValue(DEFAULT_SETTINGS);
      }
    };

    const saveSettings = (settings: DryRunSettings) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save dry run settings:', error);
      }
    };

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        saveSettings(values);
        onSave?.(values);
        message.success('Settings saved successfully');
        setVisible(false);
      } catch (error) {
        console.error('Validation failed:', error);
      }
    };

    const handleCancel = () => {
      setVisible(false);
    };

    return (
      <Modal
        title="Dry Run Settings"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={DEFAULT_SETTINGS}>
          <Form.Item
            name="defaultLevel"
            label="Default Level"
            rules={[{ required: true, message: 'Please select default level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="commonLevel"
            label="Common Level"
            rules={[{ required: true, message: 'Please select common level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="parserLevel"
            label="Parser Level"
            rules={[{ required: true, message: 'Please select parser level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="transformerLevel"
            label="Transformer Level"
            rules={[{ required: true, message: 'Please select transformer level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="entityCreatorLevel"
            label="Entity Creator Level"
            rules={[{ required: true, message: 'Please select entity creator level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="columnMappingLevel"
            label="Column Mapping Level"
            rules={[{ required: true, message: 'Please select column mapping level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="functionalMappingLevel"
            label="Functional Mapping Level"
            rules={[{ required: true, message: 'Please select functional mapping level' }]}
          >
            <Select>
              {LOG_LEVELS.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

DryRunSettingsDialog.displayName = 'DryRunSettingsDialog';

export default DryRunSettingsDialog;

