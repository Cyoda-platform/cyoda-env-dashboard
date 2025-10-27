import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { LeftSideMenu } from './LeftSideMenu';
import { MockApiToggle } from '@cyoda/processing-manager-react';
import './AppLayout.scss';

const { Content } = Layout;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on mount and location change
  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (!authData) {
      // No auth data, redirect to login
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(authData);
      if (!parsed.token) {
        // No token, redirect to login
        navigate('/login', { replace: true });
      }
    } catch (e) {
      // Invalid auth data, redirect to login
      console.error('Invalid auth data:', e);
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Show MockApiToggle only on processing-ui pages
  const showMockToggle = location.pathname.startsWith('/processing-ui');

  return (
    <Layout className="saas-app-layout">
      <AppHeader />
      <Layout hasSider>
        <LeftSideMenu collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 250,
            marginTop: 56,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content className="saas-app-content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
      {showMockToggle && <MockApiToggle />}
    </Layout>
  );
};

