/**
 * Tableau React - Routes Configuration
 * Migrated from: .old_project/packages/tableau/src/router/index.ts
 */

import { RouteObject } from 'react-router-dom';
import { Login } from '@cyoda/ui-lib-react';
import Reports from '@/pages/Reports';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Reports />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/tableau/login',
    element: <Login />,
  },
  {
    path: '/tableau/reports',
    element: <Reports />,
  },
];

export default routes;

