/**
 * Main App Component
 * Migrated from: .old_project/packages/tasks/src/App.vue
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@cyoda/http-api-react';
import { BaseLayout, LoginLayout, ErrorHandler, TasksNotifications, ErrorHandlerProvider } from '@cyoda/ui-lib-react';
import { useAuth } from '@cyoda/http-api-react';
import { routes } from './routes';
import './App.css';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/tasks/login" replace />;
  }

  return <>{children}</>;
};

// Route wrapper with layout
const RouteWithLayout: React.FC<{
  element: React.ReactNode;
  isPublic?: boolean;
  layout?: 'base' | 'login';
}> = ({ element, isPublic = false, layout = 'base' }) => {
  const content = isPublic ? element : <ProtectedRoute>{element}</ProtectedRoute>;

  if (layout === 'login') {
    return <LoginLayout>{content}</LoginLayout>;
  }

  return <BaseLayout>{content}</BaseLayout>;
};

function App() {
  return (
    <ErrorHandlerProvider>
      <QueryProvider showDevtools={import.meta.env.DEV}>
        <BrowserRouter>
          <div id="app">
            <Routes>
              {routes.map((route, index) => {
                const isPublic = route.path?.includes('/login');
                const layout = isPublic ? 'login' : 'base';

                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <RouteWithLayout element={route.element} isPublic={isPublic} layout={layout} />
                    }
                  />
                );
              })}
            </Routes>
            <TasksNotifications />
            <ErrorHandler />
          </div>
        </BrowserRouter>
      </QueryProvider>
    </ErrorHandlerProvider>
  );
}

export default App;

