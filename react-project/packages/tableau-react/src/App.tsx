/**
 * Tableau React - Main App Component
 * Migrated from: .old_project/packages/tableau/src/App.vue
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BaseLayout, LoginLayout } from '@cyoda/ui-lib-react';
import { useAuth } from '@cyoda/http-api-react';
import routes from './routes';
import './App.scss';

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
            colorPrimary: '#1890ff',
            borderRadius: 4,
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

