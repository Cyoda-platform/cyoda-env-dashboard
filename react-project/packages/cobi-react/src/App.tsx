import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from 'antd';
import AppRoutes from './routes';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <AppRoutes />
        </Content>
      </Layout>
    </BrowserRouter>
  );
};

export default App;

