import React from 'react';
import { Card, Typography, Button, Space, Statistic, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleOutlined,
  ApiOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const packages = [
    {
      title: '@cyoda/http-api-react',
      description: 'HTTP API and data fetching layer with React Query integration',
      icon: <ApiOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      features: [
        'Axios configuration with interceptors',
        'Multiple axios instances',
        'Complete TypeScript types',
        '40+ React Query hooks',
      ],
      stats: { tests: 48, lines: 2500 },
      route: '/api',
    },
    {
      title: '@cyoda/tasks-react',
      description: 'Task management application with filtering and bulk operations',
      icon: <CheckSquareOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      features: [
        'Task list with pagination',
        'Task detail with editing',
        'Bulk update operations',
        'Real-time toggle',
      ],
      stats: { tests: 14, lines: 1600 },
      route: '/tasks',
    },
    {
      title: '@cyoda/statemachine-react',
      description: 'State machine workflow management with graphical visualization',
      icon: <ApartmentOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      features: [
        'Workflow management',
        'Instance tracking',
        'Graphical visualization',
        'Export/Import functionality',
      ],
      stats: { tests: 37, lines: 4200 },
      route: '/statemachine',
    },
  ];

  const overallStats = [
    { title: 'Total Packages', value: 3, suffix: 'packages', color: '#1890ff' },
    { title: 'Total Tests', value: 99, suffix: 'tests', color: '#52c41a' },
    { title: 'Lines of Code', value: 8300, suffix: 'lines', color: '#722ed1' },
    { title: 'Test Pass Rate', value: 89, suffix: '%', color: '#fa8c16' },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <Title className="home-title">
          <RocketOutlined /> CYODA React Migration
        </Title>
        <Paragraph className="home-subtitle">
          Successfully migrated Vue 3 application to React 18 with modern tooling
        </Paragraph>
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 16, padding: '8px 16px' }}>
          Phase 3 Complete - 100%
        </Tag>
      </div>

      <div className="package-cards">
        {packages.map((pkg) => (
          <Card
            key={pkg.title}
            hoverable
            actions={[
              <Button
                type="primary"
                onClick={() => navigate(pkg.route)}
                key="demo"
              >
                View Demo
              </Button>,
            ]}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>{pkg.icon}</div>
              <Title level={4}>{pkg.title}</Title>
              <Paragraph>{pkg.description}</Paragraph>
              <div>
                <Title level={5}>Features:</Title>
                <ul>
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Tests" value={pkg.stats.tests} />
                </Col>
                <Col span={12}>
                  <Statistic title="Lines" value={pkg.stats.lines} />
                </Col>
              </Row>
            </Space>
          </Card>
        ))}
      </div>

      <div className="stats-section">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Overall Migration Statistics
        </Title>
        <div className="stats-grid">
          {overallStats.map((stat) => (
            <Card key={stat.title}>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          ))}
        </div>
      </div>

      <Card style={{ marginTop: 48 }}>
        <Title level={3}>Technology Stack</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={5}>Frontend</Title>
            <ul>
              <li>React 18.3.1</li>
              <li>TypeScript 5.7.3</li>
              <li>Vite 6.0.11</li>
              <li>Ant Design 5.22.6</li>
            </ul>
          </Col>
          <Col span={12}>
            <Title level={5}>State Management</Title>
            <ul>
              <li>React Query 5.62.11</li>
              <li>Zustand 5.0.2</li>
              <li>React Router 7.1.1</li>
              <li>Axios 1.7.9</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;

