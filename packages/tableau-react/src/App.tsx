/**
 * Tableau React - Main App Component
 * Migrated from: .old_project/packages/tableau/src/App.vue
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import routes from './routes';
import './App.scss';

// Mock layouts - will be replaced when ui-lib-react is available
const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="base-layout">{children}</div>
);

const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="login-layout">{children}</div>
);

// Mock auth hook - will be replaced when http-api-react is available
const useAuth = () => ({
  isAuthenticated: true,
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Route wrapper with authentication
const RouteWithLayout: React.FC<{
  element: React.ReactElement;
  isPublic?: boolean;
}> = ({ element, isPublic = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isPublic && !isAuthenticated) {
    return <Navigate to="/tableau/login" state={{ from: location }} replace />;
  }

  const Layout = isPublic ? LoginLayout : BaseLayout;

  return <Layout>{element}</Layout>;
};

// Title updater
const TitleUpdater: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Tableau';

    if (path.includes('/login')) {
      title = 'Login';
    } else if (path.includes('/reports')) {
      title = 'Reports';
    }

    document.title = `${title} | Cyoda`;
  }, [location]);

  return null;
};

const AppContent: React.FC = () => {
  return (
    <>
      <TitleUpdater />
      <Routes>
        {routes.map((route, index) => {
          const isPublic = route.path?.includes('/login');
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <RouteWithLayout element={route.element as React.ReactElement} isPublic={isPublic} />
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/tableau/reports" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00D4AA',
            colorPrimaryHover: '#00E5BF',
            colorLink: '#00D4AA',
            colorLinkHover: '#00E5BF',
            borderRadius: 6,
          },
          components: {
            Button: {
              // Primary button
              colorPrimary: '#00D4AA',
              colorPrimaryHover: '#00E5BF',
              colorPrimaryActive: '#00B894',
              primaryColor: '#FFFFFF',

              // Default button
              defaultBg: 'transparent',
              defaultBorderColor: 'rgba(0, 212, 170, 0.5)',
              defaultColor: '#00D4AA',
              defaultHoverBg: 'rgba(0, 212, 170, 0.1)',
              defaultHoverBorderColor: '#00D4AA',
              defaultHoverColor: '#00E5BF',
              defaultActiveBg: 'rgba(0, 212, 170, 0.15)',
              defaultActiveBorderColor: '#00B894',
              defaultActiveColor: '#00B894',

              // Text button
              textHoverBg: 'rgba(0, 212, 170, 0.1)',

              // Link button
              linkHoverBg: 'transparent',

              // Danger button
              dangerColor: '#EF4444',
              colorErrorHover: '#F87171',
              colorErrorActive: '#DC2626',
            },
          },
        }}
      >
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;

