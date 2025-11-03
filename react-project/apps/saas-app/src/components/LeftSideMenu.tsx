import React, { useState, useEffect } from 'react';
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
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';
import './LeftSideMenu.scss';

const { Sider } = Layout;
const helperStorage = new HelperStorage();

type MenuItem = Required<MenuProps>['items'][number];

interface LeftSideMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const LeftSideMenu: React.FC<LeftSideMenuProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Do you really want to logout?',
      okText: 'Logout',
      cancelText: 'Logout and Clear Data',
      closable: true,
      onOk: () => {
        // Logout without clearing data
        helperStorage.remove('auth');
        navigate('/login');
      },
      onCancel: () => {
        // Logout and clear all data
        helperStorage.clear();
        localStorage.clear(); // Also clear non-prefixed items
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

  // Handle menu item clicks with support for middle-click to open in new tab
  const handleMenuClick = (info: { key: string; domEvent: React.MouseEvent }) => {
    const { key, domEvent } = info;

    // Special handlers for non-navigation items
    if (key === 'logout') {
      handleLogout();
      return;
    }
    if (key === 'version') {
      handleVersionClick();
      return;
    }

    // Skip parent menu items (they don't navigate)
    if (key === 'reporting' || key === 'lifecycle') {
      return;
    }

    // Check if middle-click (button 1) or ctrl/cmd + click
    const isMiddleClick = domEvent.button === 1;
    const isCtrlClick = domEvent.ctrlKey || domEvent.metaKey;

    if (isMiddleClick || isCtrlClick) {
      // Open in new tab
      window.open(key, '_blank');
    } else {
      // Normal navigation
      navigate(key);
    }
  };

  const menuItems: MenuItem[] = [
    {
      key: '/trino',
      icon: <DatabaseOutlined />,
      label: 'Trino SQL schemas',
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
        },
        {
          key: '/tableau/reports/stream',
          icon: <LineChartOutlined />,
          label: 'Stream Reports',
        },
        {
          key: '/tableau/catalogue-of-aliases',
          icon: <TagsOutlined />,
          label: 'Catalog of aliases',
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
        },
        {
          key: '/instances',
          icon: <AppstoreOutlined />,
          label: 'Instances',
        },
      ],
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
    },
    {
      key: '/entity-viewer',
      icon: <EyeOutlined />,
      label: 'Entity viewer',
    },
    {
      key: '/processing-ui',
      icon: <ClusterOutlined />,
      label: 'Processing',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
    {
      key: 'version',
      icon: <InfoCircleOutlined />,
      label: 'Version App',
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

  // Initialize openKeys on mount and when collapsed state changes
  useEffect(() => {
    if (collapsed) {
      // When collapsed, close all submenus
      setOpenKeys([]);
    } else {
      // When expanded (or on initial mount if not collapsed), open appropriate submenu
      const path = location.pathname;
      const keys: string[] = [];

      if (path.startsWith('/tableau')) {
        keys.push('reporting');
      }
      if (path.startsWith('/workflows') || path.startsWith('/instances') || path.startsWith('/workflow/') || path.startsWith('/instance/')) {
        keys.push('lifecycle');
      }

      setOpenKeys(keys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]); // Only react to collapsed state changes, not route changes

  // Handle submenu open/close
  const handleOpenChange = (keys: string[]) => {
    // Only update openKeys when sidebar is expanded
    // When collapsed, let Ant Design handle the popup menu automatically
    if (!collapsed) {
      setOpenKeys(keys);
    }
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
            openKeys={collapsed ? undefined : openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
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

