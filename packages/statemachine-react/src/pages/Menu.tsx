/**
 * Menu Page
 * Main landing page for Statemachine application
 * Shows navigation to Workflows and Instances
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography } from 'antd';
import { 
  ApartmentOutlined, 
  DatabaseOutlined,
} from '@ant-design/icons';
import './Menu.scss';

const { Title, Paragraph } = Typography;

interface MenuItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, description, icon, path }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="menu-item-card"
      onClick={() => navigate(path)}
    >
      <div className="menu-item-content">
        <div className="menu-item-icon">{icon}</div>
        <Title level={3}>{title}</Title>
        <Paragraph>{description}</Paragraph>
      </div>
    </Card>
  );
};

export const Menu: React.FC = () => {
  return (
    <div className="statemachine-menu">
      <div className="menu-header">
        <Title level={1}>Workflow Designer</Title>
        <Paragraph>
          Build and edit the realtime and batch business logic of the system
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={8} lg={6}>
          <MenuItem
            title="Workflows"
            description="Design and manage state machine workflows"
            icon={<ApartmentOutlined />}
            path="/workflows"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <MenuItem
            title="Instances"
            description="View and monitor workflow instances"
            icon={<DatabaseOutlined />}
            path="/instances"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Menu;

