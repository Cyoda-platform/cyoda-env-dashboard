/**
 * Main App Component
 * Migrated from: .old_project/packages/tasks/src/App.vue
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from '@cyoda/http-api-react';
import { BaseLayout, LoginLayout, ErrorHandler, TasksNotifications, ErrorHandlerProvider } from '@cyoda/ui-lib-react';
import { useAuth } from '@cyoda/http-api-react';
import { useTasksStore } from './stores/tasksStore';
import { routes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';
import './styles/accessibility.css';

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

// App content with TasksNotifications integration
const AppContent: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { isApplyRealData, getAllTasks } = useTasksStore();

  // Get current task ID from route
  const currentTaskId = location.pathname.includes('/tasks/')
    ? location.pathname.split('/tasks/')[1]
    : undefined;

  // Handle new task notification
  const handleNewTask = () => {
    // Invalidate tasks queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  // Get token value
  const token = getToken();

  return (
    <div id="app">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
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
      <TasksNotifications
        enabled={isApplyRealData}
        token={token}
        onFetchTasks={getAllTasks}
        onNewTask={handleNewTask}
        currentTaskId={currentTaskId}
      />
      <ErrorHandler />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ErrorHandlerProvider>
        <QueryProvider showDevtools={false}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </QueryProvider>
      </ErrorHandlerProvider>
    </ErrorBoundary>
  );
}

export default App;

