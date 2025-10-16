import React from 'react';
import { Card, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const DataMapperIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>Data Mappings</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/data-mapper/configuration')}
          >
            Create Mapping
          </Button>
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

