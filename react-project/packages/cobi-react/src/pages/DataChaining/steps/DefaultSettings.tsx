import React from 'react';
import { Form, Input } from 'antd';
import type { ChainingConfigDto } from '../../../types';

interface DefaultSettingsProps {
  chainingConfig: ChainingConfigDto;
  onChange: (config: ChainingConfigDto) => void;
}

const DefaultSettings: React.FC<DefaultSettingsProps> = ({ chainingConfig, onChange }) => {
  const handleChange = (field: keyof ChainingConfigDto, value: any) => {
    onChange({
      ...chainingConfig,
      [field]: value,
    });
  };

  return (
    <div className="data-chaining-default-settings">
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please fill field Name' }]}
      >
        <Input
          value={chainingConfig.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter configuration name"
        />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea
          value={chainingConfig.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
      </Form.Item>
    </div>
  );
};

export default DefaultSettings;

