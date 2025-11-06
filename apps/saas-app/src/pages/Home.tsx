import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Row, Col, Typography, Space, Badge } from 'antd';
import {
  ThunderboltOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SendOutlined,
  PaperClipOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import './Home.scss';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32 }} />,
      title: 'AI-Powered Development',
      description: 'Build applications with intelligent assistance and automated workflows.',
      color: '#52c41a',
    },
    {
      icon: <DatabaseOutlined style={{ fontSize: 32 }} />,
      title: 'Entity-Driven Architecture',
      description: "Leverage CYODA's entity database for scalable, event-driven applications.",
      color: '#1890ff',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32 }} />,
      title: 'Rapid Prototyping',
      description: 'From concept to deployment in minutes with intelligent code generation.',
      color: '#722ed1',
    },
  ];

  const quickStartItems = [
    {
      title: 'Deploy my environment',
      path: '/processing-ui',
    },
    {
      title: 'What is my CYODA env?',
      path: '/entity-viewer',
    },
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Status Badge */}
        <div className="status-badge">
          <Badge status="success" text="READY TO BUILD" />
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <Title level={1} className="welcome-title">
            Welcome to CYODA AI Assistant
          </Title>
          <Paragraph className="welcome-subtitle">
            Build, deploy and scale data-intensive operational services with intelligent assistance
          </Paragraph>
        </div>

        {/* Feature Cards */}
        <Row gutter={[24, 24]} className="features-section">
          {features.map((feature, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card className="feature-card" variant="borderless">
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <Title level={4} className="feature-title">
                  {feature.title}
                </Title>
                <Paragraph className="feature-description">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Input Section */}
        <div className="input-section">
          <Card className="input-card" variant="borderless">
            <TextArea
              placeholder="What would you like to build together today?"
              autoSize={{ minRows: 3, maxRows: 6 }}
              className="input-textarea"
            />
            <div className="input-actions">
              <Button
                type="text"
                icon={<PaperClipOutlined />}
                className="attach-button"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                className="send-button"
              >
                Send
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Start Section */}
        <div className="quick-start-section">
          <div className="quick-start-header">
            <ThunderboltOutlined className="quick-start-icon" />
            <Title level={4} className="quick-start-title">
              Quick Start
            </Title>
          </div>
          <Row gutter={[16, 16]}>
            {quickStartItems.map((item, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card
                  className="quick-start-card"
                  variant="borderless"
                  hoverable
                  onClick={() => navigate(item.path)}
                >
                  <Space className="quick-start-content">
                    <Text className="quick-start-text">{item.title}</Text>
                    <ArrowRightOutlined className="quick-start-arrow" />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Home;

