import React, { useState, useEffect } from 'react';
import { Card, Typography, Steps, Button, Space, Select, Form, Input, Radio, message, Spin } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import UploadFile from '../../components/DataMapper/UploadFile';
import EntitySelection from '../../components/DataMapper/EntitySelection';
import DataMapper from '../../components/DataMapper/DataMapper';
import { useEntityTypes } from '../../hooks';
import { useSaveDataMapping, useDataMapping } from '../../hooks/useDataMapping';
import type { MappingConfigDto, EntityMappingConfigDto } from '../../types';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const DataMapperEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Get initial data from location state (for copy functionality)
  const initialDataFromState = (location.state as any)?.initialData;

  // Fetch entity types
  const { data: entityTypes = [], isLoading: isLoadingEntityTypes } = useEntityTypes(false);

  // Fetch existing mapping if editing
  const { data: existingMapping, isLoading: isLoadingMapping } = useDataMapping(id || null);

  // Save mutation
  const saveMutation = useSaveDataMapping();

  // Initialize data mapping config
  const [dataMappingConfig, setDataMappingConfig] = useState<MappingConfigDto>({
    '@bean': 'com.cyoda.plugins.mapping.core.dtos.DataMappingConfigDto',
    id: null,
    name: '',
    dataType: 'CSV',
    description: '',
    sampleContent: '',
    metadata: '',
    parserParameters: {
      delimiter: ',',
      quoteChar: '"',
      withHeader: true,
    },
    entityMappings: [],
  });

  // Source data parsed from uploaded file
  const [sourceData, setSourceData] = useState<any>(null);

  // Load existing mapping data when editing or copying
  useEffect(() => {
    const dataToLoad = existingMapping || initialDataFromState;
    if (dataToLoad) {
      setDataMappingConfig(dataToLoad);
      // Set form values
      form.setFieldsValue({
        name: dataToLoad.name,
        dataType: dataToLoad.dataType,
        description: dataToLoad.description,
      });
    }
  }, [existingMapping, initialDataFromState, form]);

  // Initialize entity mapping when moving to Step 3
  useEffect(() => {
    if (currentStep === 3 && dataMappingConfig.entityMappings.length === 0) {
      // Create initial entity mapping
      const initialEntityMapping: EntityMappingConfigDto = {
        id: {
          id: null,
          uiId: 1,
        },
        name: '',
        entityClass: null,
        entityRelationConfigs: [
          {
            srcRelativeRootPath: '',
            parentRelationPath: '',
            parentEntityClass: null,
          },
        ],
        columns: [],
        functionalMappings: [],
        columnPathsForUniqueCheck: [],
        metadata: [],
        entityFilter: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'AND',
          conditions: [],
        },
        isShowNoneMappingFields: true,
        isPolymorphicList: false,
        cobiCoreMetadata: [],
        cobiPathsRelations: [],
        script: {
          inputSrcPaths: [],
          inputMetaPaths: [],
          reusableScripts: [],
          body: '',
        },
      };

      setDataMappingConfig(prev => ({
        ...prev,
        entityMappings: [initialEntityMapping],
      }));
    }
  }, [currentStep]);

  const steps = [
    {
      title: 'Default Settings',
      description: 'Configure basic settings',
    },
    {
      title: 'Upload File',
      description: 'Upload sample data file',
    },
    {
      title: 'CSV Settings',
      description: 'Configure CSV parsing',
    },
    {
      title: 'Select Entity',
      description: 'Choose target entity',
    },
    {
      title: 'Data Mapping',
      description: 'Map source to target',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveUploadFile = (content: string) => {
    setDataMappingConfig({
      ...dataMappingConfig,
      sampleContent: content,
    });

    // Parse source data based on data type
    try {
      if (dataMappingConfig.dataType === 'JSON') {
        setSourceData(JSON.parse(content));
      } else if (dataMappingConfig.dataType === 'XML') {
        // For XML, store as string for now
        setSourceData(content);
      } else if (dataMappingConfig.dataType === 'CSV') {
        // For CSV, store as string for now
        // The DataMapper component will parse it using csv-parse
        setSourceData(content);
      }
    } catch (error) {
      console.error('Error parsing source data:', error);
      message.error('Failed to parse source data');
    }

    handleNext();
  };

  const handleDefaultSettingsSave = () => {
    form.validateFields().then((values) => {
      setDataMappingConfig({
        ...dataMappingConfig,
        name: values.name,
        dataType: values.dataType,
        parserParameters: {
          ...dataMappingConfig.parserParameters,
          delimiter: values.delimiter || ',',
          quoteChar: values.quoteChar || '"',
          withHeader: values.withHeader !== false,
        },
      });
      handleNext();
    });
  };

  const handleSaveMapping = async () => {
    try {
      // Validate that we have at least one entity mapping
      if (!dataMappingConfig.entityMappings || dataMappingConfig.entityMappings.length === 0) {
        message.error('Please configure at least one entity mapping');
        return;
      }

      // Save the mapping configuration
      await saveMutation.mutateAsync(dataMappingConfig);
      message.success('Data mapping configuration saved successfully!');

      // Navigate back to the list
      setTimeout(() => {
        navigate('/data-mapper');
      }, 1000);
    } catch (error) {
      console.error('Error saving mapping:', error);
      message.error('Failed to save mapping configuration');
    }
  };

  // Show loading spinner while fetching existing mapping
  if (id && isLoadingMapping) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Loading mapping configuration..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            {id ? 'Edit Data Mapper Configuration' : 'Create Data Mapper Configuration'}
          </Title>
          <Button onClick={() => navigate('/data-mapper')}>Back to List</Button>
        </div>

        <Steps
          current={currentStep}
          items={steps}
          style={{ marginTop: '24px', marginBottom: '32px' }}
        />

        {/* Step 0: Default Settings */}
        {currentStep === 0 && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Title level={4}>Default Settings</Title>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: dataMappingConfig.name,
                dataType: dataMappingConfig.dataType,
                delimiter: ',',
                quoteChar: '"',
                withHeader: true,
              }}
            >
              <Form.Item
                label="Mapping Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a mapping name' }]}
              >
                <Input placeholder="Enter mapping name" />
              </Form.Item>

              <Form.Item
                label="Data Type"
                name="dataType"
                rules={[{ required: true, message: 'Please select a data type' }]}
              >
                <Select>
                  <Option value="CSV">CSV</Option>
                  <Option value="JSON">JSON</Option>
                  <Option value="XML">XML</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.dataType !== currentValues.dataType}
              >
                {({ getFieldValue }) =>
                  getFieldValue('dataType') === 'CSV' && (
                    <>
                      <Form.Item label="Delimiter" name="delimiter">
                        <Input placeholder="," maxLength={1} />
                      </Form.Item>

                      <Form.Item label="Quote Character" name="quoteChar">
                        <Input placeholder={'"'} maxLength={1} />
                      </Form.Item>

                      <Form.Item label="Has Header Row" name="withHeader" valuePropName="checked">
                        <Radio.Group>
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>
            </Form>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Button type="primary" onClick={handleDefaultSettingsSave}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Title level={4}>Upload Sample Data File</Title>
            <Paragraph type="secondary">
              Upload a sample {dataMappingConfig.dataType} file to configure the data mapping.
              This file will be used to preview and map the data structure.
            </Paragraph>

            <UploadFile
              dataMappingConfigDto={dataMappingConfig}
              isEnableEditor={true}
              onSave={handleSaveUploadFile}
              onOpenEditor={() => {
                // TODO: Implement content editor
                console.log('Open content editor');
              }}
            />

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handlePrevious}>Previous</Button>
              <Button
                type="primary"
                onClick={handleNext}
                disabled={!dataMappingConfig.sampleContent}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: CSV Settings */}
        {currentStep === 2 && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Title level={4}>CSV Settings</Title>
            {dataMappingConfig.dataType === 'CSV' ? (
              <>
                <Paragraph type="secondary">
                  Configure how the CSV file should be parsed.
                </Paragraph>
                <Form layout="vertical">
                  <Form.Item label="Delimiter">
                    <Input
                      value={dataMappingConfig.parserParameters?.delimiter || ','}
                      onChange={(e) => setDataMappingConfig({
                        ...dataMappingConfig,
                        parserParameters: {
                          ...dataMappingConfig.parserParameters,
                          delimiter: e.target.value,
                        },
                      })}
                      maxLength={1}
                    />
                  </Form.Item>
                  <Form.Item label="Quote Character">
                    <Input
                      value={dataMappingConfig.parserParameters?.quoteChar || '"'}
                      onChange={(e) => setDataMappingConfig({
                        ...dataMappingConfig,
                        parserParameters: {
                          ...dataMappingConfig.parserParameters,
                          quoteChar: e.target.value,
                        },
                      })}
                      maxLength={1}
                    />
                  </Form.Item>
                  <Form.Item label="Has Header Row">
                    <Radio.Group
                      value={dataMappingConfig.parserParameters?.withHeader !== false}
                      onChange={(e) => setDataMappingConfig({
                        ...dataMappingConfig,
                        parserParameters: {
                          ...dataMappingConfig.parserParameters,
                          withHeader: e.target.value,
                        },
                      })}
                    >
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </>
            ) : (
              <Paragraph>
                CSV settings are only applicable for CSV data type. You can skip this step.
              </Paragraph>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handlePrevious}>Previous</Button>
              <Button type="primary" onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Entity */}
        {currentStep === 3 && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Title level={4}>Select Target Entity</Title>
            <Paragraph type="secondary">
              Select the target entity class and configure entity mapping settings.
            </Paragraph>

            {isLoadingEntityTypes ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Typography.Text>Loading entity types...</Typography.Text>
              </div>
            ) : (
              <EntitySelection
                sourceData={sourceData}
                noneMappingFields={[]}
                isFirst={true}
                dataMappingConfigDto={dataMappingConfig}
                onEntityMappingChange={(entityMapping: EntityMappingConfigDto) => {
                  // Update the first entity mapping
                  setDataMappingConfig(prev => ({
                    ...prev,
                    entityMappings: [entityMapping],
                  }));
                }}
              />
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handlePrevious}>Previous</Button>
              <Button
                type="primary"
                onClick={handleNext}
                disabled={!dataMappingConfig.entityMappings[0]?.entityClass}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Data Mapping */}
        {currentStep === 4 && (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Data Mapping</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  Map source fields to target entity properties using drag & drop.
                </Paragraph>
              </div>
              <Space>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button onClick={() => navigate('/data-mapper')}>Cancel</Button>
                <Button type="primary" onClick={handleSaveMapping}>
                  Save Mapping
                </Button>
              </Space>
            </div>

            <DataMapper
              dataMappingConfig={dataMappingConfig}
              sourceData={sourceData}
              noneMappingFields={[]}
              onEntityEdit={(entityMapping: EntityMappingConfigDto) => {
                // Update entity mapping
                const index = dataMappingConfig.entityMappings.findIndex(
                  em => em.id.uiId === entityMapping.id.uiId
                );
                if (index !== -1) {
                  const newEntityMappings = [...dataMappingConfig.entityMappings];
                  newEntityMappings[index] = entityMapping;
                  setDataMappingConfig(prev => ({
                    ...prev,
                    entityMappings: newEntityMappings,
                  }));
                }
              }}
              onEntityDelete={(entityMapping: EntityMappingConfigDto) => {
                // Remove entity mapping
                setDataMappingConfig(prev => ({
                  ...prev,
                  entityMappings: prev.entityMappings.filter(
                    em => em.id.uiId !== entityMapping.id.uiId
                  ),
                }));
              }}
              onEntityAdd={() => {
                // Add new entity mapping
                message.info('Add entity mapping functionality will be implemented');
              }}
              onUploadFile={() => {
                // Go back to upload step
                setCurrentStep(1);
              }}
              onEditContent={() => {
                message.info('Edit content functionality will be implemented');
              }}
              onEditCSVSettings={() => {
                // Go back to CSV settings step
                setCurrentStep(2);
              }}
              onEditScript={() => {
                message.info('Edit script functionality will be implemented');
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataMapperEdit;


