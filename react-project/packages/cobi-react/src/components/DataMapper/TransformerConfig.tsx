import React, { useState } from 'react';
import { Button, Empty, Divider, Select, Form, Input, InputNumber, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnMappingConfigDto } from '../../types';
import './TransformerConfig.css';

interface TransformerConfigProps {
  transformer: any;
  columnMapping: ColumnMappingConfigDto;
  sourceData?: any;
  onChange: (transformer: any) => void;
}

// Mock transformer list - in real app, this would come from API
const MOCK_TRANSFORMERS = [
  {
    transformerKey: 'TO_STRING',
    name: 'To String',
    description: 'Convert value to string',
    inType: 'java.lang.Object',
    outType: 'java.lang.String',
    parameters: [],
  },
  {
    transformerKey: 'TO_INTEGER',
    name: 'To Integer',
    description: 'Convert value to integer',
    inType: 'java.lang.Object',
    outType: 'java.lang.Integer',
    parameters: [],
  },
  {
    transformerKey: 'TO_DOUBLE',
    name: 'To Double',
    description: 'Convert value to double',
    inType: 'java.lang.Object',
    outType: 'java.lang.Double',
    parameters: [],
  },
  {
    transformerKey: 'TO_BOOLEAN',
    name: 'To Boolean',
    description: 'Convert value to boolean',
    inType: 'java.lang.Object',
    outType: 'java.lang.Boolean',
    parameters: [],
  },
  {
    transformerKey: 'TO_DATE',
    name: 'To Date',
    description: 'Convert value to date',
    inType: 'java.lang.String',
    outType: 'java.util.Date',
    parameters: [
      { name: 'format', type: 'string', required: true, defaultValue: 'yyyy-MM-dd' },
    ],
  },
  {
    transformerKey: 'SUBSTRING',
    name: 'Substring',
    description: 'Extract substring',
    inType: 'java.lang.String',
    outType: 'java.lang.String',
    parameters: [
      { name: 'start', type: 'number', required: true },
      { name: 'end', type: 'number', required: false },
    ],
  },
  {
    transformerKey: 'TRIM',
    name: 'Trim',
    description: 'Remove whitespace from both ends',
    inType: 'java.lang.String',
    outType: 'java.lang.String',
    parameters: [],
  },
  {
    transformerKey: 'UPPER_CASE',
    name: 'Upper Case',
    description: 'Convert to uppercase',
    inType: 'java.lang.String',
    outType: 'java.lang.String',
    parameters: [],
  },
  {
    transformerKey: 'LOWER_CASE',
    name: 'Lower Case',
    description: 'Convert to lowercase',
    inType: 'java.lang.String',
    outType: 'java.lang.String',
    parameters: [],
  },
  {
    transformerKey: 'REPLACE',
    name: 'Replace',
    description: 'Replace text',
    inType: 'java.lang.String',
    outType: 'java.lang.String',
    parameters: [
      { name: 'search', type: 'string', required: true },
      { name: 'replace', type: 'string', required: true },
    ],
  },
];

const TransformerConfig: React.FC<TransformerConfigProps> = ({
  transformer,
  columnMapping,
  sourceData,
  onChange,
}) => {
  const [localTransformer, setLocalTransformer] = useState(transformer || { children: [] });

  const handleAddTransformer = () => {
    const newChild = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerChildConfigDto',
      transformerKey: '',
      parameters: {},
      restriction: null,
    };

    const updated = {
      ...localTransformer,
      children: [...localTransformer.children, newChild],
    };

    setLocalTransformer(updated);
    onChange(updated);
  };

  const handleDeleteTransformer = (index: number) => {
    const updated = {
      ...localTransformer,
      children: localTransformer.children.filter((_: any, i: number) => i !== index),
    };

    setLocalTransformer(updated);
    onChange(updated);
  };

  const handleTransformerChange = (index: number, transformerKey: string) => {
    const updated = { ...localTransformer };
    updated.children[index].transformerKey = transformerKey;
    updated.children[index].parameters = {};

    setLocalTransformer(updated);
    onChange(updated);
  };

  const handleParameterChange = (index: number, paramName: string, value: any) => {
    const updated = { ...localTransformer };
    if (!updated.children[index].parameters) {
      updated.children[index].parameters = {};
    }
    updated.children[index].parameters[paramName] = value;

    setLocalTransformer(updated);
    onChange(updated);
  };

  const getTransformerInfo = (transformerKey: string) => {
    return MOCK_TRANSFORMERS.find((t) => t.transformerKey === transformerKey);
  };

  const getInboundData = () => {
    if (!sourceData || !columnMapping.srcColumnPath) return null;
    // TODO: Extract value from source data using path
    return 'Sample data';
  };

  const getInboundType = () => {
    const data = getInboundData();
    if (data === null || data === undefined) return 'null';
    return typeof data;
  };

  return (
    <div className="transformer-config">
      <div className="dialog-title-info">
        <div>
          <strong>Relation:</strong> {columnMapping.srcColumnPath} → {columnMapping.dstCyodaColumnPath}
        </div>
        <div>
          <strong>Inbound data:</strong> {getInboundData()} ({getInboundType()})
        </div>
      </div>

      {localTransformer.children.length === 0 ? (
        <Empty description="No transformers yet">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTransformer}>
            Add Transformer
          </Button>
        </Empty>
      ) : (
        <>
          {localTransformer.children.map((child: any, index: number) => {
            const transformerInfo = getTransformerInfo(child.transformerKey);

            return (
              <div key={index} className="transformer-item">
                <div className="transformer-header">
                  <h4>Transformer {index + 1}</h4>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTransformer(index)}
                  >
                    Delete
                  </Button>
                </div>

                <Form layout="vertical">
                  <Form.Item label="Transformer Type" required>
                    <Select
                      value={child.transformerKey || undefined}
                      placeholder="Select transformer"
                      onChange={(value) => handleTransformerChange(index, value)}
                      options={MOCK_TRANSFORMERS.map((t) => ({
                        label: t.name,
                        value: t.transformerKey,
                      }))}
                    />
                  </Form.Item>

                  {transformerInfo && transformerInfo.description && (
                    <Alert
                      message={transformerInfo.description}
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  {transformerInfo &&
                    transformerInfo.parameters &&
                    transformerInfo.parameters.length > 0 && (
                      <>
                        <Divider>Parameters</Divider>
                        {transformerInfo.parameters.map((param: any) => (
                          <Form.Item
                            key={param.name}
                            label={param.name}
                            required={param.required}
                          >
                            {param.type === 'number' ? (
                              <InputNumber
                                value={child.parameters?.[param.name]}
                                onChange={(value) =>
                                  handleParameterChange(index, param.name, value)
                                }
                                style={{ width: '100%' }}
                              />
                            ) : (
                              <Input
                                value={child.parameters?.[param.name] || param.defaultValue}
                                onChange={(e) =>
                                  handleParameterChange(index, param.name, e.target.value)
                                }
                              />
                            )}
                          </Form.Item>
                        ))}
                      </>
                    )}
                </Form>

                {index < localTransformer.children.length - 1 && <Divider />}
              </div>
            );
          })}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTransformer}
            style={{ marginTop: 16 }}
          >
            Add Transformer
          </Button>
        </>
      )}
    </div>
  );
};

export default TransformerConfig;

