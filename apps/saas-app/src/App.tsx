import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, theme as antdTheme, App as AntdApp } from 'antd';
import { Auth0Provider } from '@auth0/auth0-react';
import { AppRoutes } from './routes';
import { auth0Config } from './config/auth0';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeStore } from './stores/themeStore';
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

// Ant Design theme configuration - CYODA AI Assistant Theme
const getDarkTheme = () => ({
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
      bodyPadding: 0, // Remove default padding for consistent alignment
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
      rowHoverBg: '#1f3d3a', // Solid color: base + 5% teal (instead of transparent)
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
      cardGutter: 4,
      // Active tab background - same as header
      cardHeight: 40,
    },
    Dropdown: {
      // Solid opaque background for dropdown menus
      colorBgElevated: '#1E2A3A',
      colorText: '#E5E7EB',
      colorTextDescription: '#9CA3AF',
      controlItemBgHover: 'rgba(0, 212, 170, 0.1)',
      controlItemBgActive: 'rgba(0, 212, 170, 0.15)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
    },
    Transfer: {
      listBg: '#1E2A3A',
      listHeaderBg: '#243142',
      itemBg: 'transparent',
      itemHoverBg: 'rgba(0, 212, 170, 0.1)',
      itemSelectedBg: 'rgba(0, 212, 170, 0.15)',
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorText: '#F9FAFB',
      colorTextPlaceholder: '#9CA3AF',
      hoverBorderColor: '#00D4AA',
      activeBorderColor: '#00D4AA',
      activeShadow: '0 0 0 2px rgba(0, 212, 170, 0.1)',
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorText: '#F9FAFB',
      colorTextPlaceholder: '#9CA3AF',
      optionSelectedBg: 'rgba(0, 212, 170, 0.15)',
      optionActiveBg: 'rgba(0, 212, 170, 0.1)',
      // Solid opaque background for select dropdown
      colorBgElevated: '#1E2A3A',
    },
    Checkbox: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorPrimary: '#00D4AA',
      colorPrimaryHover: '#00E5BF',
    },
  },
});

// Light theme configuration (placeholder - will be customized later)
const getLightTheme = () => ({
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
  algorithm: antdTheme.defaultAlgorithm, // Use Ant Design's light algorithm
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F5F5F5',
    },
    Menu: {
      itemBg: '#FFFFFF',
      itemSelectedBg: 'rgba(0, 212, 170, 0.1)',
      itemHoverBg: 'rgba(0, 212, 170, 0.05)',
      itemColor: '#4B5563',
      itemSelectedColor: '#00D4AA',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: 'rgba(0, 0, 0, 0.06)',
      bodyPadding: 0,
    },
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#4B5563',
      rowHoverBg: 'rgba(0, 212, 170, 0.05)',
    },
  },
});

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
  const mode = useThemeStore((state) => state.mode);
  const theme = mode === 'dark' ? getDarkTheme() : getLightTheme();

  return (
    <ErrorBoundary>
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={auth0Config.authorizationParams}
        cacheLocation={auth0Config.cacheLocation}
        useRefreshTokens={auth0Config.useRefreshTokens}
      >
        <ConfigProvider theme={theme}>
          <AntdApp>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Suspense fallback={<LoadingFallback />}>
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                </Suspense>
              </BrowserRouter>
            </QueryClientProvider>
          </AntdApp>
        </ConfigProvider>
      </Auth0Provider>
    </ErrorBoundary>
  );
}

export default App;

