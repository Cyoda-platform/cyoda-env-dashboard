import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Tabs,
  Alert,
  Divider,
  Badge,
  message,
} from 'antd';
import { TableOutlined, EyeOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSchema, useSaveSchema } from '../../hooks/useSqlSchema';
import { validateSchemaName, validateTableName, toLowerCaseField } from '../../utils/validation';
import { countHiddenTables } from '../../utils/helpers';
import type { SqlSchema, SqlTable, EntityModel } from '../../types';
import ModelsPopUp, { ModelsPopUpRef } from '../../components/dialogs/ModelsPopUp';
import HiddenTablesPopUp, { HiddenTablesPopUpRef } from '../../components/dialogs/HiddenTablesPopUp';
import HiddenFieldsPopUp, { HiddenFieldsPopUpRef } from '../../components/dialogs/HiddenFieldsPopUp';
import TrinoEditTable from '../../components/TrinoEditTable/TrinoEditTable';
import { getAllFields, updateFieldInNested } from '../../utils/helpers';
import './TrinoEdit.css';

const TrinoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isNew = !id;

  // State
  const [schemaData, setSchemaData] = useState<SqlSchema>({
    id: null,
    schemaName: '',
    tables: [],
  });
  const [activeTab, setActiveTab] = useState('0');
  const [tableFilter, setTableFilter] = useState('');
  const [currentTableIndex, setCurrentTableIndex] = useState<number>(0);

  // Refs for dialogs
  const modelsPopUpRef = useRef<ModelsPopUpRef>(null);
  const hiddenTablesPopUpRef = useRef<HiddenTablesPopUpRef>(null);
  const hiddenFieldsPopUpRef = useRef<HiddenFieldsPopUpRef>(null);

  // Fetch schema if editing
  const { data: fetchedSchema, isLoading } = useSchema(id, !isNew);
  const saveSchema = useSaveSchema();

  // Load schema data
  useEffect(() => {
    if (fetchedSchema && !isNew) {
      const processedSchema = {
        ...fetchedSchema,
        schemaName: fetchedSchema.schemaName.toLowerCase().replaceAll('-', '_'),
        tables: fetchedSchema.tables.map((table) => ({
          ...table,
          tableName: table.tableName.toLowerCase(),
        })),
      };
      setSchemaData(processedSchema);
      form.setFieldsValue({ schemaName: processedSchema.schemaName });
    }
  }, [fetchedSchema, isNew, form]);

  // Filter tables
  const filteredTables = useMemo(() => {
    if (!tableFilter) {
      return schemaData.tables.filter((table) => !table.hidden);
    }
    return schemaData.tables
      .filter((table) => !table.hidden)
      .filter((table) => table.tableName.toLowerCase().includes(tableFilter.toLowerCase()));
  }, [schemaData.tables, tableFilter]);

  // Count hidden tables
  const hiddenTablesCount = useMemo(() => {
    return countHiddenTables(schemaData.tables);
  }, [schemaData.tables]);

  // Handle schema name change
  const handleSchemaNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = toLowerCaseField(e.target.value);
    setSchemaData((prev) => ({ ...prev, schemaName: value }));
    form.setFieldValue('schemaName', value);
  };

  // These will be used in Phase 6 when implementing the table editor
  // const handleTableNameChange = (index: number, value: string) => {
  //   const lowerValue = toLowerCaseField(value);
  //   setSchemaData((prev) => {
  //     const newTables = [...prev.tables];
  //     newTables[index] = { ...newTables[index], tableName: lowerValue };
  //     return { ...prev, tables: newTables };
  //   });
  // };

  // const handleHideTable = (index: number) => {
  //   setSchemaData((prev) => {
  //     const newTables = [...prev.tables];
  //     newTables[index] = { ...newTables[index], hidden: true };
  //     return { ...prev, tables: newTables };
  //   });
  // };

  // Handle save
  const handleSave = async () => {
    try {
      await form.validateFields();

      // Check for table name errors
      const hasTableErrors = schemaData.tables.some((table) => {
        if (table.hidden) return false;
        return validateTableName(table.tableName, schemaData.tables);
      });

      if (hasTableErrors) {
        message.error('Please fix table name errors before saving');
        return;
      }

      await saveSchema.mutateAsync(schemaData);
      message.success('Schema saved successfully');
      navigate('/trino');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Handle add tables
  const handleAddTables = () => {
    modelsPopUpRef.current?.open();
  };

  // Handle open hidden tables
  const handleOpenHiddenTables = () => {
    hiddenTablesPopUpRef.current?.open();
  };

  // Handle tables change from ModelsPopUp
  const handleTablesChange = (newTables: SqlTable[]) => {
    setSchemaData((prev) => ({
      ...prev,
      tables: [...prev.tables, ...newTables],
    }));
  };

  // Handle delete tables from ModelsPopUp
  const handleDeleteTables = (metadataClassIds: string[]) => {
    setSchemaData((prev) => ({
      ...prev,
      tables: prev.tables.filter((table) => !metadataClassIds.includes(table.metadataClassId)),
    }));
  };

  // Handle update tables from ModelsPopUp
  const handleUpdateTables = async (_data: { tables: SqlTable[]; metaId: string; row: EntityModel }) => {
    try {
      // TODO: Implement actual update logic with API
      message.success('Tables updated successfully');
    } catch (error) {
      message.error('Failed to update tables');
    }
  };

  // Handle fields change from HiddenFieldsPopUp
  const handleFieldsChange = (updatedFields: any[]) => {
    setSchemaData((prev) => {
      const newTables = [...prev.tables];
      const tableIndex = currentTableIndex;

      if (tableIndex >= 0 && tableIndex < newTables.length) {
        // Update each field in the nested structure
        let updatedTableFields = newTables[tableIndex].fields;

        updatedFields.forEach((updatedField) => {
          updatedTableFields = updateFieldInNested(
            updatedTableFields,
            updatedField.fieldName,
            { hidden: updatedField.hidden }
          );
        });

        newTables[tableIndex] = {
          ...newTables[tableIndex],
          fields: updatedTableFields,
        };
      }

      return { ...prev, tables: newTables };
    });
  };

  // Check if there are validation errors
  const hasErrors = useMemo(() => {
    return schemaData.tables.some((table) => {
      if (table.hidden) return false;
      return validateTableName(table.tableName, schemaData.tables);
    });
  }, [schemaData.tables]);

  if (isLoading) {
    return <div className="trino-edit">Loading...</div>;
  }

  return (
    <div className="trino-edit">
      <div className="card">
        <div className="card-body">
          <h4>Edit Schema</h4>

          {hasErrors && (
            <Alert
              message="Errors"
              description="Please check the tables. There is an error in one of the fields."
              type="error"
              showIcon
              closable={false}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form form={form} layout="vertical">
            <Form.Item
              label="Schema Name"
              name="schemaName"
              rules={[
                { required: true, message: 'Please input Schema Name' },
                {
                  validator: (_, value) => {
                    const error = validateSchemaName(value);
                    return error ? Promise.reject(error) : Promise.resolve();
                  },
                },
              ]}
            >
              <div className="trino-edit-inner-box">
                <Input
                  value={schemaData.schemaName}
                  onChange={handleSchemaNameChange}
                  style={{ flex: 1 }}
                />
                <Button
                  type="default"
                  icon={<TableOutlined />}
                  onClick={handleAddTables}
                >
                  Manage tables
                </Button>
              </div>
            </Form.Item>
          </Form>

          <Divider />

          {schemaData.tables.length > 0 && (
            <>
              <div className="trino-edit-action-filter">
                <Input
                  placeholder="Filter"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  style={{ width: 250 }}
                />
                <Badge count={hiddenTablesCount} showZero={false}>
                  <Button icon={<EyeOutlined />} onClick={handleOpenHiddenTables} />
                </Badge>
              </div>

              {filteredTables.length > 0 && (
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  tabPosition="left"
                  items={filteredTables.map((table, filteredIndex) => {
                    // Find the real index in schemaData.tables
                    const realIndex = schemaData.tables.findIndex(
                      (t) => t.metadataClassId === table.metadataClassId
                    );
                    const allFields = getAllFields(table.fields);
                    const hiddenFieldsCount = allFields.filter((f) => f.hidden).length;

                    return {
                      key: String(filteredIndex),
                      label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{table.tableName}</span>
                          {hiddenFieldsCount > 0 && (
                            <Badge count={hiddenFieldsCount} showZero={false} />
                          )}
                        </div>
                      ),
                      children: (
                        <div key={filteredIndex}>
                          {/* Table Name */}
                          <Form.Item
                            label="Table Name"
                            validateStatus={validateTableName(table.tableName, schemaData.tables) ? 'error' : ''}
                            help={validateTableName(table.tableName, schemaData.tables)}
                          >
                            <div className="trino-edit-inner-box">
                              <Input
                                value={table.tableName}
                                onChange={(e) => {
                                  const value = e.target.value.toLowerCase();
                                  setSchemaData((prev) => {
                                    const newTables = [...prev.tables];
                                    newTables[realIndex] = { ...newTables[realIndex], tableName: value };
                                    return { ...prev, tables: newTables };
                                  });
                                }}
                                style={{ flex: 1 }}
                              />
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  setSchemaData((prev) => {
                                    const newTables = [...prev.tables];
                                    newTables[realIndex] = { ...newTables[realIndex], hidden: true };
                                    return { ...prev, tables: newTables };
                                  });
                                }}
                              />
                              <Badge count={hiddenFieldsCount} showZero={false}>
                                <Button
                                  icon={<EyeOutlined />}
                                  onClick={() => {
                                    setCurrentTableIndex(realIndex);
                                    hiddenFieldsPopUpRef.current?.open(allFields);
                                  }}
                                />
                              </Badge>
                            </div>
                          </Form.Item>

                          {/* Uniformed Path */}
                          <Form.Item label="Uniformed Path">
                            <Input value={table.uniformedPath} disabled readOnly />
                          </Form.Item>

                          <TrinoEditTable
                            table={table}
                            fieldsName="fields"
                            basePropPath={`tables.${realIndex}`}
                            allFields={allFields}
                            onFieldsChange={(newFields) => {
                              setSchemaData((prev) => {
                                const newTables = [...prev.tables];
                                newTables[realIndex] = { ...newTables[realIndex], fields: newFields };
                                return { ...prev, tables: newTables };
                              });
                            }}
                          />
                        </div>
                      ),
                    };
                  })}
                />
              )}
            </>
          )}

          <div className="trino-edit-actions">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saveSchema.isPending}
            >
              Save Schema
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ModelsPopUp
        ref={modelsPopUpRef}
        tables={schemaData.tables}
        onChange={handleTablesChange}
        onDeleteTables={handleDeleteTables}
        onUpdateTables={handleUpdateTables}
      />
      <HiddenTablesPopUp
        ref={hiddenTablesPopUpRef}
        tables={schemaData.tables}
        onTablesChange={(updatedTables) => {
          setSchemaData((prev) => ({
            ...prev,
            tables: updatedTables,
          }));
        }}
      />
      <HiddenFieldsPopUp
        ref={hiddenFieldsPopUpRef}
        onFieldsChange={handleFieldsChange}
      />
    </div>
  );
};

export default TrinoEdit;

