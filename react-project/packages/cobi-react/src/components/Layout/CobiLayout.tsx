import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  LinkOutlined,
  ApiOutlined,
  DashboardOutlined,
  ToolOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import './CobiLayout.css';

const { Header, Sider, Content } = Layout;

interface CobiLayoutProps {
  children: React.ReactNode;
}

const CobiLayout: React.FC<CobiLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/data-mapper',
      icon: <HomeOutlined />,
      label: 'Data Mappings',
    },
    {
      key: '/data-chaining',
      icon: <LinkOutlined />,
      label: 'Chaining',
    },
    {
      key: '/data-mapper/data-source-config-creation',
      icon: <ApiOutlined />,
      label: 'Connectors',
    },
    {
      key: '/data-management-dashboard',
      icon: <DashboardOutlined />,
      label: 'Data Mgmt Dashboard',
    },
    {
      key: '/tools',
      icon: <ToolOutlined />,
      label: 'Tools',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const getSelectedKey = () => {
    const path = location.pathname;

    // Match exact paths or their sub-paths
    if (path.startsWith('/data-chaining')) return '/data-chaining';
    if (path.startsWith('/data-mapper/data-source-config-creation')) return '/data-mapper/data-source-config-creation';
    if (path.startsWith('/data-management-dashboard')) return '/data-management-dashboard';
    if (path.startsWith('/tools')) return '/tools';
    if (path.startsWith('/data-mapper')) return '/data-mapper';

    return '/data-mapper';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="cobi-logo">
          {!collapsed ? (
            <h2 style={{ color: '#fff', margin: '16px', textAlign: 'center' }}>COBI</h2>
          ) : (
            <h2 style={{ color: '#fff', margin: '16px', textAlign: 'center' }}>C</h2>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '18px', cursor: 'pointer' },
          })}
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
            CYODA COBI - Configuration & Business Intelligence
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CobiLayout;

