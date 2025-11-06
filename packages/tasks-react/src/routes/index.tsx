/**
 * Routes Configuration
 * Migrated from: .old_project/packages/tasks/src/router/routes.ts
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Tasks } from '../pages/Tasks';
import { TaskDetail } from '../pages/TaskDetail';
import { Home, Login } from '@cyoda/ui-lib-react';

export const routes: RouteObject[] = [
  {
    path: '/tasks/login',
    element: <Login />,
  },
  {
    path: '/menu',
    element: <Home />,
  },
  {
    path: '/',
    element: <Tasks />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/tasks',
    element: <Tasks />,
  },
  {
    path: '/tasks/:id',
    element: <TaskDetail />,
  },
];

