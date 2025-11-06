import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import CobiLayout from './components/Layout/CobiLayout';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CobiLayout>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </CobiLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

