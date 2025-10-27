import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, theme as antdTheme } from 'antd';
import { AppRoutes } from './routes';
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

// Ant Design theme configuration - CYODA AI Assistant Dark Theme
const theme = {
  token: {
    colorPrimary: '#00D4AA',
    colorSuccess: '#00D4AA',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    colorLink: '#00D4AA',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  algorithm: antdTheme.darkAlgorithm, // Use Ant Design's dark algorithm
  components: {
    Layout: {
      headerBg: '#1E2A3A',
      siderBg: '#1E2A3A',
      bodyBg: '#1A2332',
    },
    Menu: {
      darkItemBg: '#1E2A3A',
      darkItemSelectedBg: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)',
      darkItemHoverBg: 'rgba(0, 212, 170, 0.1)',
      darkItemColor: '#D1D5DB',
      darkItemSelectedColor: '#FFFFFF',
    },
    Button: {
      primaryShadow: '0 4px 6px -1px rgba(0, 212, 170, 0.4)',
    },
    Card: {
      colorBgContainer: '#1E2A3A',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
    },
    Modal: {
      contentBg: '#1E2A3A',
      headerBg: '#1E2A3A',
    },
    Table: {
      headerBg: '#243142',
      headerColor: '#D1D5DB',
      headerSortActiveBg: '#2A3A4F',
      headerSortHoverBg: '#2A3A4F',
      rowHoverBg: 'rgba(0, 212, 170, 0.1)',
      bodySortBg: 'rgba(0, 212, 170, 0.03)',
    },
    Pagination: {
      itemBg: 'transparent',
      itemActiveBg: 'rgba(0, 212, 170, 0.15)',
      itemLinkBg: 'transparent',
      itemInputBg: 'transparent',
      itemActiveBgDisabled: 'transparent',
    },
    Message: {
      contentBg: '#243142',
      contentPadding: '12px 16px',
    },
    Notification: {
      colorBgElevated: '#243142',
      colorText: '#F9FAFB',
      colorTextHeading: '#FFFFFF',
      colorIcon: '#00D4AA',
      colorIconHover: '#00E5BF',
    },
    Tabs: {
      itemColor: '#D1D5DB',
      itemHoverColor: '#D1D5DB',
      itemSelectedColor: '#00D4AA',
      itemActiveColor: '#00D4AA',
      inkBarColor: '#00D4AA',
      cardBg: 'transparent',
    },
  },
};

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#0A0E27',
  }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;

