import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  ApiOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
    },
    {
      key: '/statemachine',
      icon: <ApartmentOutlined />,
      label: 'State Machine',
    },
    {
      key: '/api-demo',
      icon: <ApiOutlined />,
      label: 'API Demo',
    },
    {
      key: '/entity-viewer',
      icon: <DatabaseOutlined />,
      label: 'Entity Viewer',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/tasks')) return '/tasks';
    if (path.startsWith('/statemachine')) return '/statemachine';
    if (path.startsWith('/api-demo')) return '/api-demo';
    if (path.startsWith('/entity-viewer')) return '/entity-viewer';
    return '/';
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="app-logo">CYODA React Demo</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end' }}
        />
      </Header>
      <Content className="app-content">{children}</Content>
      <Footer className="app-footer">
        CYODA React Migration Demo ©{new Date().getFullYear()} - All Packages Migrated Successfully
      </Footer>
    </Layout>
  );
};

export default AppLayout;

