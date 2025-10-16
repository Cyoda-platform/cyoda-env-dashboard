import React from 'react';
import { Card, Typography, Steps } from 'antd';

const { Title, Paragraph } = Typography;

const DataMapperEdit: React.FC = () => {
  const [currentStep] = React.useState(0);

  const steps = [
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

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Data Mapper Configuration</Title>
        <Paragraph type="secondary">
          🚧 Under construction - Data Mapper Edit page
        </Paragraph>
        
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginTop: '24px' }}
        />

        <div style={{ marginTop: '24px', padding: '24px', background: '#f5f5f5', borderRadius: '4px' }}>
          <Paragraph>
            This page will provide a step-by-step wizard for creating and editing data mappings:
          </Paragraph>
          <ul>
            <li><strong>Step 1:</strong> Upload sample data file (CSV, XML, JSON)</li>
            <li><strong>Step 2:</strong> Configure CSV parsing settings (delimiter, headers, etc.)</li>
            <li><strong>Step 3:</strong> Select target entity class</li>
            <li><strong>Step 4:</strong> Visual data mapping interface with drag-and-drop</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default DataMapperEdit;

