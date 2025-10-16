/**
 * Tableau React - Routes Configuration
 * Migrated from: .old_project/packages/tableau/src/router/index.ts
 */

import { RouteObject } from 'react-router-dom';
import Reports from '@/pages/Reports';

// Mock Login component - will be replaced when ui-lib-react is available
const Login = () => <div>Login Page</div>;

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

