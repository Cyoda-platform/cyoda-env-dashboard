// Mock for @cyoda/ui-lib-react
// This will be replaced with the actual package once it's available

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { HomeOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="login-layout">{children}</div>;
};

export const BaseLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current selected menu key based on path
  const getSelectedKey = () => {
    if (location.pathname.includes('/cyoda-sass/trino/schema')) {
      return 'create';
    }
    if (location.pathname.includes('/cyoda-sass/trino')) {
      return 'schemas';
    }
    return 'home';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: 'schemas',
      icon: <DatabaseOutlined />,
      label: 'Schemas',
      onClick: () => navigate('/cyoda-sass/trino'),
    },
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: 'Create Schema',
      onClick: () => navigate('/cyoda-sass/trino/schema'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px',
        gap: '24px'
      }}>
        <div style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginRight: '24px'
        }}>
          Cyoda SaaS
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

