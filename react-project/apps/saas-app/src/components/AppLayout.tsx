import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { LeftSideMenu } from './LeftSideMenu';
import { MockApiToggle } from '@cyoda/processing-manager-react';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';
import { useAppStore } from '@cyoda/cyoda-sass-react';
import './AppLayout.scss';

const { Content } = Layout;
const helperStorage = new HelperStorage();

export const AppLayout: React.FC = () => {
  // Use persisted store for menu collapse state
  const isToggledMenu = useAppStore((state) => state.isToggledMenu);
  const toggleMenu = useAppStore((state) => state.toggleMenu);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on mount and location change
  useEffect(() => {
    const authData = helperStorage.get('auth');
    if (!authData) {
      // No auth data, redirect to login
      navigate('/login', { replace: true });
      return;
    }

    if (!authData.token) {
      // No token, redirect to login
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Show MockApiToggle only on processing-ui pages
  const showMockToggle = location.pathname.startsWith('/processing-ui');

  return (
    <Layout className="saas-app-layout">
      <AppHeader />
      <Layout hasSider>
        <LeftSideMenu collapsed={isToggledMenu} onCollapse={toggleMenu} />
        <Layout
          style={{
            marginLeft: isToggledMenu ? 80 : 250,
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

