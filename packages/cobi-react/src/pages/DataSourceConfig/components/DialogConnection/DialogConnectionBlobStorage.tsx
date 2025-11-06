import React from 'react';
import { Form, Input } from 'antd';

interface DialogConnectionBlobStorageProps {
  connectionDetailsDto: any;
  onChange?: (values: any) => void;
}

const DialogConnectionBlobStorage: React.FC<DialogConnectionBlobStorageProps> = ({
  connectionDetailsDto,
  onChange,
}) => {
  const handleChange = (field: string, value: any) => {
    if (onChange) {
      onChange({ ...connectionDetailsDto, [field]: value });
    }
  };

  return (
    <div className="dialog-connection-blob-storage">
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input connection name' }]}
      >
        <Input
          value={connectionDetailsDto.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter connection name"
        />
      </Form.Item>
    </div>
  );
};

export default DialogConnectionBlobStorage;

