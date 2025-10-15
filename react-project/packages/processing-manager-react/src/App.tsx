/**
 * Main App Component
 * Migrated from @cyoda/processing-manager/src/App.vue
 */

import { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, Spin, Alert } from 'antd';
import { routes } from './routes';
import './App.scss';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
          <Alert
            message="Application Error"
            description={
              <div>
                <p><strong>Error:</strong> {this.state.error?.message}</p>
                <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                  {this.state.error?.stack}
                </pre>
                <button onClick={() => window.location.reload()}>Reload Page</button>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
                  <Spin size="large" />
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

