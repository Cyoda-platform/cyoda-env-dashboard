import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Space, Divider, Alert, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
import CodeEditor from '../CodeEditor';
import type { FunctionalMappingConfigDto } from '../../types';
import './FunctionalMappingSettings.css';

interface FunctionalMappingSettingsProps {
  visible: boolean;
  functionalMapping: FunctionalMappingConfigDto | null;
  sourceData?: any;
  availableSourcePaths?: string[];
  onSave: (functionalMapping: FunctionalMappingConfigDto) => void;
  onCancel: () => void;
}

const FunctionalMappingSettings: React.FC<FunctionalMappingSettingsProps> = ({
  visible,
  functionalMapping,
  availableSourcePaths = [],
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [localMapping, setLocalMapping] = useState<FunctionalMappingConfigDto | null>(null);
  const [codeEditorVisible, setCodeEditorVisible] = useState(false);
  const [currentStatementIndex, setCurrentStatementIndex] = useState<number>(-1);
  const [currentStatementCode, setCurrentStatementCode] = useState<string>('');

  useEffect(() => {
    if (functionalMapping) {
      setLocalMapping({ ...functionalMapping });
      form.setFieldsValue({
        name: functionalMapping.name,
        dstPath: functionalMapping.dstPath,
        srcPaths: functionalMapping.srcPaths,
      });
    }
  }, [functionalMapping, form]);

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

  const handleAddSourcePath = (path: string) => {
    if (localMapping && !localMapping.srcPaths.includes(path)) {
      const updated = {
        ...localMapping,
        srcPaths: [...localMapping.srcPaths, path],
      };
      setLocalMapping(updated);
      form.setFieldsValue({ srcPaths: updated.srcPaths });
    }
  };

  const handleRemoveSourcePath = (path: string) => {
    if (localMapping) {
      const updated = {
        ...localMapping,
        srcPaths: localMapping.srcPaths.filter((p) => p !== path),
      };
      setLocalMapping(updated);
      form.setFieldsValue({ srcPaths: updated.srcPaths });
    }
  };

  const handleAddStatement = () => {
    if (localMapping) {
      const newStatement: any = {
        type: 'RETURN' as const,
        expression: {
          type: 'CONSTANT',
          constantSource: 'INPUT' as const,
          args: [],
        },
        collectElemsSetModes: [],
      };
      const updated = {
        ...localMapping,
        statements: [...localMapping.statements, newStatement],
      };
      setLocalMapping(updated);
    }
  };

  const handleEditStatement = (index: number) => {
    setCurrentStatementIndex(index);
    // Convert statement object to JSON for editing
    const statement = localMapping?.statements[index];
    setCurrentStatementCode(statement ? JSON.stringify(statement, null, 2) : '');
    setCodeEditorVisible(true);
  };

  const handleDeleteStatement = (index: number) => {
    if (localMapping) {
      const updated = {
        ...localMapping,
        statements: localMapping.statements.filter((_, i) => i !== index),
      };
      setLocalMapping(updated);
    }
  };

  const handleSaveCode = (code: string) => {
    if (localMapping && currentStatementIndex >= 0) {
      try {
        const parsed = JSON.parse(code);
        const updated = { ...localMapping };
        updated.statements[currentStatementIndex] = parsed;
        setLocalMapping(updated);
        setCodeEditorVisible(false);
        setCurrentStatementIndex(-1);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localMapping) {
      setLocalMapping({
        ...localMapping,
        name: e.target.value || null,
      });
    }
  };

  if (!localMapping) return null;

  const getStatementPreview = (statement: any): string => {
    return JSON.stringify(statement, null, 2).substring(0, 100);
  };

  return (
    <>
      <Modal
        title="Functional Mapping Settings"
        open={visible}
        onOk={handleSave}
        onCancel={onCancel}
        width={900}
        className="functional-mapping-settings-modal"
      >
        <div className="functional-mapping-settings">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Name"
              name="name"
              help="If you do not fill this field, it will be generated automatically"
            >
              <Input
                placeholder="Optional name for this mapping"
                onChange={handleNameChange}
              />
            </Form.Item>

            <Form.Item
              label="Target Path"
              name="dstPath"
              rules={[{ required: true, message: 'Please enter target path' }]}
            >
              <Input disabled />
            </Form.Item>

            <Divider>Source Paths</Divider>

            <Form.Item label="Selected Source Paths">
              <div className="source-paths-list">
                {localMapping.srcPaths.length === 0 ? (
                  <Alert
                    message="No source paths selected"
                    description="Add source paths to use in your functional mapping"
                    type="info"
                    showIcon
                  />
                ) : (
                  <Space wrap>
                    {localMapping.srcPaths.map((path) => (
                      <Tag
                        key={path}
                        closable
                        onClose={() => handleRemoveSourcePath(path)}
                      >
                        {path}
                      </Tag>
                    ))}
                  </Space>
                )}
              </div>
            </Form.Item>

            <Form.Item label="Add Source Path">
              <Select
                placeholder="Select a source path to add"
                onChange={handleAddSourcePath}
                value={undefined}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableSourcePaths
                  .filter((path) => !localMapping.srcPaths.includes(path))
                  .map((path) => ({
                    label: path,
                    value: path,
                  }))}
              />
            </Form.Item>

            <Divider>Statements</Divider>

            <div className="statements-section">
              {localMapping.statements.length === 0 ? (
                <Alert
                  message="No statements defined"
                  description="Add JavaScript/Groovy statements to transform your data"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <div className="statements-list">
                  {localMapping.statements.map((statement, index) => (
                    <div key={index} className="statement-item">
                      <div className="statement-header">
                        <span className="statement-label">Statement {index + 1}</span>
                        <Space>
                          <Button
                            type="text"
                            icon={<CodeOutlined />}
                            onClick={() => handleEditStatement(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteStatement(index)}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                      <pre className="statement-preview">
                        {getStatementPreview(statement)}
                        {JSON.stringify(statement).length > 100 ? '...' : ''}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddStatement}
                style={{ marginTop: 16 }}
              >
                Add Statement
              </Button>
            </div>
          </Form>

          <Divider />

          <Alert
            message="Functional Mapping Info"
            description="Functional mappings allow you to use multiple source paths and custom JavaScript/Groovy code to transform data before mapping it to the target."
            type="info"
            showIcon
          />
        </div>
      </Modal>

      <Modal
        title={`Edit Statement ${currentStatementIndex + 1}`}
        open={codeEditorVisible}
        onOk={() => handleSaveCode(currentStatementCode)}
        onCancel={() => {
          setCodeEditorVisible(false);
          setCurrentStatementIndex(-1);
        }}
        width={1000}
        className="code-editor-modal"
      >
        <Alert
          message="Edit Statement JSON"
          description="Edit the statement configuration as JSON. Make sure the JSON is valid before saving."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <CodeEditor
          value={currentStatementCode}
          onChange={(value) => setCurrentStatementCode(value || '')}
          language="json"
          height="500px"
        />
      </Modal>
    </>
  );
};

export default FunctionalMappingSettings;

