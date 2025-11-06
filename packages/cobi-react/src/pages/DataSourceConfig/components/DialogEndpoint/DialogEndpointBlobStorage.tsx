import React, { useState, useRef } from 'react';
import { Form, Select, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import DialogEndpointFieldOperation from './Fields/DialogEndpointFieldOperation';
import BlobStorageParameters from '../BlobStorageParameters/BlobStorageParameters';
import DialogCreateDataMapping, {
  DialogCreateDataMappingRef,
} from '../../../DataManagementDashboard/components/DialogCreateDataMapping';
import './DialogEndpointBlobStorage.css';

interface DialogEndpointBlobStorageProps {
  endpointDto: any;
  listAllDataMappings: any[];
  onChange?: (values: any) => void;
}

const DialogEndpointBlobStorage: React.FC<DialogEndpointBlobStorageProps> = ({
  endpointDto,
  listAllDataMappings,
  onChange,
}) => {
  const dialogCreateDataMappingRef = useRef<DialogCreateDataMappingRef>(null);

  const dataMappingConfigOptions = listAllDataMappings.map((el) => ({
    value: el.id,
    label: el.name,
  }));

  const handleConsumerChange = (value: string) => {
    if (onChange) {
      onChange({
        ...endpointDto,
        consumerConfig: {
          ...endpointDto.consumerConfig,
          configId: value,
        },
      });
    }
  };

  const onEditMappingConfig = () => {
    dialogCreateDataMappingRef.current?.open();
  };

  return (
    <div className="dialog-endpoint-blob-storage">
      <DialogEndpointFieldOperation endpointDto={endpointDto} onChange={onChange} />

      <div className="flex-row">
        <div className="full-width">
          <Form.Item
            label="Consumer"
            name={['consumerConfig', 'configId']}
            rules={[{ required: true, message: 'Please select consumer' }]}
          >
            <Select
              value={endpointDto.consumerConfig?.configId}
              onChange={handleConsumerChange}
              placeholder="Select"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={dataMappingConfigOptions}
            />
          </Form.Item>
        </div>
        <div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            disabled={!endpointDto.consumerConfig?.configId}
            onClick={onEditMappingConfig}
          >
            Edit
          </Button>
        </div>
      </div>

      <BlobStorageParameters
        parameters={endpointDto.parameters || []}
        onChange={(params) => {
          if (onChange) {
            onChange({ ...endpointDto, parameters: params });
          }
        }}
      />

      <DialogCreateDataMapping ref={dialogCreateDataMappingRef} />
    </div>
  );
};

export default DialogEndpointBlobStorage;

