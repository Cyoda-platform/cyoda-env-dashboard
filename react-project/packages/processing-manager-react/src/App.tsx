/**
 * Main App Component
 * Migrated from @cyoda/processing-manager/src/App.vue
 */

import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, Spin } from 'antd';
import { routes } from './routes';
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

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense
            fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
              }}>
                <Spin size="large" tip="Loading..." />
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

