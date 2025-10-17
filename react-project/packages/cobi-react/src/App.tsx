import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from 'antd';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Content>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </Content>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

