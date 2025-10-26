import React, { useState } from 'react';
import { Layout, Menu, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DatabaseOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  CheckSquareOutlined,
  EyeOutlined,
  ClusterOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { VersionInfo } from '@cyoda/ui-lib-react';
import type { MenuProps } from 'antd';
import './LeftSideMenu.scss';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export const LeftSideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Do you really want to logout?',
      okText: 'Logout',
      cancelText: 'Logout and Clear Data',
      onOk: () => {
        // Logout without clearing data
        localStorage.removeItem('auth');
        navigate('/login');
      },
      onCancel: () => {
        // Logout and clear all data
        localStorage.clear();
        navigate('/login');
      },
      okButtonProps: {
        danger: true,
      },
    });
  };

  const handleVersionClick = () => {
    setVersionModalVisible(true);
  };

  const menuItems: MenuItem[] = [
    {
      key: '/trino',
      icon: <DatabaseOutlined />,
      label: 'Trino SQL schemas',
      onClick: () => navigate('/trino'),
    },
    {
      key: 'reporting',
      icon: <FileTextOutlined />,
      label: 'Reporting',
      children: [
        {
          key: '/tableau/reports',
          label: 'Report config editor',
          onClick: () => navigate('/tableau/reports'),
        },
        {
          key: '/tableau/reports/stream',
          label: 'Stream Reports',
          onClick: () => navigate('/tableau/reports/stream'),
        },
        {
          key: '/tableau/catalogue-of-aliases',
          label: 'Catalog of aliases',
          onClick: () => navigate('/tableau/catalogue-of-aliases'),
        },
      ],
    },
    {
      key: 'lifecycle',
      icon: <ApartmentOutlined />,
      label: 'Lifecycle',
      children: [
        {
          key: '/workflows',
          label: 'Workflow',
          onClick: () => navigate('/workflows'),
        },
        {
          key: '/instances',
          label: 'Instances',
          onClick: () => navigate('/instances'),
        },
      ],
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
      onClick: () => navigate('/tasks'),
    },
    {
      key: '/entity-viewer',
      icon: <EyeOutlined />,
      label: 'Entity viewer',
      onClick: () => navigate('/entity-viewer'),
    },
    {
      key: '/processing-ui',
      icon: <ClusterOutlined />,
      label: 'Processing',
      onClick: () => navigate('/processing-ui'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
    {
      key: 'version',
      icon: <InfoCircleOutlined />,
      label: 'Version App',
      onClick: handleVersionClick,
    },
  ];

  // Determine selected key based on current path
  const getSelectedKey = (): string[] => {
    const path = location.pathname;
    
    // Check for exact matches first
    if (path.startsWith('/trino')) return ['/trino'];
    if (path.startsWith('/tableau/reports/stream')) return ['/tableau/reports/stream'];
    if (path.startsWith('/tableau/catalogue-of-aliases')) return ['/tableau/catalogue-of-aliases'];
    if (path.startsWith('/tableau/reports')) return ['/tableau/reports'];
    if (path.startsWith('/workflows') || path.startsWith('/workflow/')) return ['/workflows'];
    if (path.startsWith('/instances') || path.startsWith('/instance/')) return ['/instances'];
    if (path.startsWith('/tasks')) return ['/tasks'];
    if (path.startsWith('/entity-viewer')) return ['/entity-viewer'];
    if (path.startsWith('/processing-ui')) return ['/processing-ui'];
    
    return [];
  };

  // Determine which submenu should be open
  const getOpenKeys = (): string[] => {
    const path = location.pathname;
    const openKeys: string[] = [];
    
    if (path.startsWith('/tableau')) {
      openKeys.push('reporting');
    }
    if (path.startsWith('/workflows') || path.startsWith('/instances') || path.startsWith('/workflow/') || path.startsWith('/instance/')) {
      openKeys.push('lifecycle');
    }
    
    return openKeys;
  };

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        theme="dark"
        className="saas-left-side-menu"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 64, // Below header
          bottom: 0,
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* Version Info Modal */}
      {versionModalVisible && (
        <div style={{ display: 'none' }}>
          <VersionInfo
            uiVersion={import.meta.env.VITE_APP_UI_VERSION}
            uiBuildTime={import.meta.env.VITE_APP_UI_BUILD_TIME}
            uiBranchName={import.meta.env.VITE_APP_UI_BRANCH_NAME}
          />
        </div>
      )}
      <Modal
        title="Version Information"
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={600}
      >
        <VersionInfo
          uiVersion={import.meta.env.VITE_APP_UI_VERSION || '1.0.0'}
          uiBuildTime={import.meta.env.VITE_APP_UI_BUILD_TIME || new Date().toISOString()}
          uiBranchName={import.meta.env.VITE_APP_UI_BRANCH_NAME || 'main'}
        />
      </Modal>
    </>
  );
};

