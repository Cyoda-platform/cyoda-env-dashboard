/**
 * Main App Component
 * Migrated from: .old_project/packages/statemachine/src/App.vue
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import { BaseLayout, LoginLayout, ErrorHandler, ErrorHandlerProvider } from '@cyoda/ui-lib-react';
import { routes } from './routes';
import './App.css';

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

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Protected routes */}
            {routes
              .filter((route) => route.path !== '/login')
              .map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
                      {route.element}
                    </div>
                  }
                />
              ))}

            {/* Redirect root to menu */}
            <Route path="/" element={<Navigate to="/menu" replace />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;

