import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './DataSourceConfigDialogRequestOperation.css';

interface RequestField {
  key: string;
  value: string;
  isCustom?: boolean;
}

interface DataSourceConfigDialogRequestOperationProps {
  dataSourceOperation: any;
  activeRequestFields: any;
  index: number;
}

const DataSourceConfigDialogRequestOperation: React.FC<DataSourceConfigDialogRequestOperationProps> = ({
  dataSourceOperation,
  activeRequestFields,
  index,
}) => {
  const [requestFieldsArr, setRequestFieldsArr] = useState<RequestField[]>([]);
  const [clientDataArr, setClientDataArr] = useState<RequestField[]>([]);

  // Initialize request fields
  useEffect(() => {
    if (requestFieldsArr.length === 0 && dataSourceOperation.request_fields) {
      const originalKeys = Object.keys(activeRequestFields);
      const fields: RequestField[] = [];

      Object.keys(dataSourceOperation.request_fields).forEach((key) => {
        fields.push({
          key,
          value: dataSourceOperation.request_fields[key] || '',
          isCustom: !originalKeys.includes(key),
        });
      });

      setRequestFieldsArr(fields);
    }
  }, [dataSourceOperation.request_fields, activeRequestFields, requestFieldsArr.length]);

  // Initialize client data
  useEffect(() => {
    if (clientDataArr.length === 0 && dataSourceOperation.clientData) {
      const data: RequestField[] = [];

      Object.keys(dataSourceOperation.clientData).forEach((key) => {
        data.push({
          key,
          value: dataSourceOperation.clientData[key] || '',
        });
      });

      setClientDataArr(data);
    }
  }, [dataSourceOperation.clientData, clientDataArr.length]);

  const onChangeRequestFields = (updatedFields: RequestField[]) => {
    setRequestFieldsArr(updatedFields);
    dataSourceOperation.request_fields = {};
    updatedFields.forEach((el) => {
      dataSourceOperation.request_fields[el.key] = el.value;
    });
  };

  const onChangeClientData = (updatedData: RequestField[]) => {
    setClientDataArr(updatedData);
    dataSourceOperation.clientData = {};
    updatedData.forEach((el) => {
      dataSourceOperation.clientData[el.key] = el.value;
    });
  };

  const onAddRequestFields = () => {
    const updated = [...requestFieldsArr, { key: '', value: '', isCustom: true }];
    onChangeRequestFields(updated);
  };

  const onAddClientData = () => {
    const updated = [...clientDataArr, { key: '', value: '' }];
    onChangeClientData(updated);
  };

  const deleteRequestField = (index: number) => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to remove row?',
      onOk: () => {
        const updated = requestFieldsArr.filter((_, i) => i !== index);
        onChangeRequestFields(updated);
      },
    });
  };

  const deleteClientData = (index: number) => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to remove row?',
      onOk: () => {
        const updated = clientDataArr.filter((_, i) => i !== index);
        onChangeClientData(updated);
      },
    });
  };

  const updateRequestField = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...requestFieldsArr];
    updated[index][field] = newValue;
    onChangeRequestFields(updated);
  };

  const updateClientData = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...clientDataArr];
    updated[index][field] = newValue;
    onChangeClientData(updated);
  };

  return (
    <div className="data-source-config-dialog-request-operation">
      <div className="title-client-data">
        <h4>Request Fields</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddRequestFields}>
          Add
        </Button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="td-name">Name</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {requestFieldsArr.map((row, idx) => (
            <tr key={idx}>
              {row.isCustom ? (
                <td>
                  <Input
                    value={row.key}
                    onChange={(e) => updateRequestField(idx, 'key', e.target.value)}
                  />
                </td>
              ) : (
                <td className="td-mapping">{row.key}</td>
              )}
              <td>
                <Input
                  value={row.value}
                  onChange={(e) => updateRequestField(idx, 'value', e.target.value)}
                />
              </td>
              <td className="action">
                {row.isCustom && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRequestField(idx)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ margin: '20px 0' }} />

      <div className="title-client-data">
        <h4>Client Data</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddClientData}>
          Add
        </Button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clientDataArr.map((row, idx) => (
            <tr key={idx}>
              <td>
                <Input
                  value={row.key}
                  onChange={(e) => updateClientData(idx, 'key', e.target.value)}
                />
              </td>
              <td>
                <Input
                  value={row.value}
                  onChange={(e) => updateClientData(idx, 'value', e.target.value)}
                />
              </td>
              <td className="action">
                <Button danger icon={<DeleteOutlined />} onClick={() => deleteClientData(idx)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataSourceConfigDialogRequestOperation;

