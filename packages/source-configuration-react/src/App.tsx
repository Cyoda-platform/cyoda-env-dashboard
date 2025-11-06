/**
 * Main App component for Source Configuration
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout } from 'antd';
import SourceConfigRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const { Content } = Layout;

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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
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
            <Layout style={{ minHeight: '100vh' }}>
              <Content style={{ padding: '24px' }}>
                <ErrorBoundary>
                  <SourceConfigRoutes />
                </ErrorBoundary>
              </Content>
            </Layout>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

