/**
 * CSV Settings Component
 * Configure CSV parsing parameters
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, Alert, Table, Divider } from 'antd';
import { parseCsv, getCsvPreviewRows, validateCsv } from '../../utils/contentHelper';
import type { MappingConfigDto } from '../../types';
import './CSVSettings.css';

interface CSVSettingsProps {
  dataMappingConfigDto: MappingConfigDto;
  onChange?: (config: MappingConfigDto) => void;
}

const CSVSettings: React.FC<CSVSettingsProps> = ({ dataMappingConfigDto, onChange }) => {
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewRows, setPreviewRows] = useState<string[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Initialize form values
  useEffect(() => {
    const params = dataMappingConfigDto.parserParameters || {};
    form.setFieldsValue({
      withHeader: params.withHeader !== false,
      delimiter: params.delimiter || ',',
      quoteChar: params.quoteChar || '"',
    });

    updatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMappingConfigDto.sampleContent]);

  // Update preview when parameters change
  const updatePreview = () => {
    try {
      // Get raw preview rows
      const rows = getCsvPreviewRows(dataMappingConfigDto.sampleContent || '', 5);
      setPreviewRows(rows);

      // Parse CSV data
      const validation = validateCsv(dataMappingConfigDto);
      if (!validation.valid) {
        setParsingError(validation.error || 'Failed to parse CSV');
        setPreviewData([]);
        return;
      }

      const data = parseCsv(dataMappingConfigDto);
      setPreviewData(data.slice(0, 10)); // Show first 10 rows
      setParsingError(null);
    } catch (error: any) {
      setParsingError(error.message);
      setPreviewData([]);
    }
  };

  // Handle form value changes
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    // Update config
    const updatedConfig = {
      ...dataMappingConfigDto,
      parserParameters: {
        ...dataMappingConfigDto.parserParameters,
        ...allValues,
      },
    };

    // Update preview
    setTimeout(() => {
      updatePreview();
    }, 100);

    // Notify parent
    if (onChange) {
      onChange(updatedConfig);
    }
  };

  // Get table columns from preview data
  const getTableColumns = () => {
    if (previewData.length === 0) return [];

    const firstRow = previewData[0];
    if (typeof firstRow !== 'object') return [];

    return Object.keys(firstRow).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      ellipsis: true,
      width: 150,
    }));
  };

  return (
    <div className="csv-settings-component">
      <div className="raw-preview">
        <h4>Raw Content Preview (First 5 Lines)</h4>
        <div className="raw-content">
          {previewRows.map((row, index) => (
            <div key={index} className="raw-row">
              {row}
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="With Header"
          name="withHeader"
          valuePropName="checked"
          tooltip="First row contains column headers"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Delimiter"
          name="delimiter"
          rules={[
            { required: true, message: 'Delimiter is required' },
            { max: 1, message: 'Delimiter must be a single character' },
          ]}
          tooltip="Character used to separate columns (e.g., comma, semicolon, tab)"
        >
          <Input placeholder="," maxLength={1} style={{ width: 100 }} />
        </Form.Item>

        <Form.Item
          label="Quote Character"
          name="quoteChar"
          rules={[
            { required: true, message: 'Quote character is required' },
            { max: 1, message: 'Quote character must be a single character' },
          ]}
          tooltip="Character used to quote values containing special characters"
        >
          <Input placeholder={'"'} maxLength={1} style={{ width: 100 }} />
        </Form.Item>
      </Form>

      <Divider />

      <div className="parsed-preview">
        <h4>Parsed Data Preview</h4>
        {parsingError ? (
          <Alert
            message="Parsing Error"
            description={parsingError}
            type="error"
            showIcon
          />
        ) : previewData.length > 0 ? (
          <>
            <Alert
              message={`Successfully parsed ${previewData.length} rows`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={previewData}
              columns={getTableColumns()}
              pagination={false}
              scroll={{ x: 'max-content' }}
              size="small"
              rowKey={(_record, index) => index?.toString() || '0'}
            />
          </>
        ) : (
          <Alert
            message="No data to preview"
            description="Upload a CSV file to see the preview"
            type="info"
            showIcon
          />
        )}
      </div>
    </div>
  );
};

export default CSVSettings;

