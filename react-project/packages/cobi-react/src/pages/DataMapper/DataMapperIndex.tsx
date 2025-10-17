import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AIGenerateButton } from '../../components/AIGenerate';

const { Title, Paragraph } = Typography;

const DataMapperIndex: React.FC = () => {
  const navigate = useNavigate();

  const handleAIGenerateSuccess = () => {
    console.log('AI Generate completed successfully');
    // TODO: Refresh the data mappings list
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>Data Mappings</Title>
          <Space>
            <AIGenerateButton type="dataMapper" onSuccess={handleAIGenerateSuccess} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/data-mapper/configuration')}
            >
              Create Mapping
            </Button>
          </Space>
        </div>
        <Paragraph>
          This page will display a list of all data mapping configurations.
          You can create, edit, and delete data mappings here.
        </Paragraph>
        <Paragraph type="secondary">
          🚧 Under construction - Data Mapper Index page
        </Paragraph>
      </Card>
    </div>
  );
};

export default DataMapperIndex;

