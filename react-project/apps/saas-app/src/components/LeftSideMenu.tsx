import React, { useState } from 'react';
import { Layout, Menu, Modal, Button } from 'antd';
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TagsOutlined,
  ProjectOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './LeftSideMenu.scss';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface LeftSideMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const LeftSideMenu: React.FC<LeftSideMenuProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
          icon: <BarChartOutlined />,
          label: 'Report config editor',
          onClick: () => navigate('/tableau/reports'),
        },
        {
          key: '/tableau/reports/stream',
          icon: <LineChartOutlined />,
          label: 'Stream Reports',
          onClick: () => navigate('/tableau/reports/stream'),
        },
        {
          key: '/tableau/catalogue-of-aliases',
          icon: <TagsOutlined />,
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
          icon: <ProjectOutlined />,
          label: 'Workflow',
          onClick: () => navigate('/workflows'),
        },
        {
          key: '/instances',
          icon: <AppstoreOutlined />,
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
        onCollapse={onCollapse}
        width={250}
        collapsedWidth={80}
        theme="dark"
        className="saas-left-side-menu"
        trigger={null}
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          left: 0,
          top: 64, // Below header
          bottom: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKey()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            style={{
              borderRight: 0,
              borderInlineEnd: 0,
              flex: 1,
              border: 'none',
            }}
          />
          <div className="sidebar-collapse-trigger">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => onCollapse(!collapsed)}
              style={{
                width: '100%',
                height: 48,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 0,
                color: 'var(--refine-text-secondary)',
              }}
            />
          </div>
        </div>
      </Sider>

      {/* Version Info Modal */}
      <Modal
        title=""
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={600}
      >
        <div>
          <h2>Platform</h2>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Version:</div>
              <div className="value">-</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Build Time:</div>
              <div className="value">-</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Branch Name:</div>
              <div className="value">-</div>
            </div>
          </div>

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #d9d9d9' }} />

          <h2>Client</h2>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Version:</div>
              <div className="value">-</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Build Time:</div>
              <div className="value">-</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Branch Name:</div>
              <div className="value">-</div>
            </div>
          </div>

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #d9d9d9' }} />

          <h2>UI</h2>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Version:</div>
              <div className="value">{import.meta.env.VITE_APP_UI_VERSION || '1.0.0'}</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Build Time:</div>
              <div className="value">{import.meta.env.VITE_APP_UI_BUILD_TIME || new Date().toISOString()}</div>
            </div>
          </div>
          <div className="detail-tree-item">
            <div className="title-value">
              <div className="name">Branch Name:</div>
              <div className="value">{import.meta.env.VITE_APP_UI_BRANCH_NAME || 'main'}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

