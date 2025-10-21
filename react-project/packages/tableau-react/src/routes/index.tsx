/**
 * Tableau React - Routes Configuration
 * Migrated from: .old_project/packages/tableau/src/router/index.ts
 */

import { RouteObject } from 'react-router-dom';
import Reports from '@/pages/Reports';
import ReportEditor from '@/pages/ReportEditor';
import ReportConfigsStream from '@/pages/ReportConfigsStream';
import ReportEditorStream from '@/pages/ReportEditorStream';

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
    element: <Reports />, // Main Reports page with tabs (Report Config + Reports History)
  },
  {
    path: '/tableau/reports/stream',
    element: <ReportConfigsStream />, // Stream Reports page (separate from Reports)
  },
  {
    path: '/tableau/report-editor/:id',
    element: <ReportEditor />,
  },
  {
    path: '/tableau/reports/stream/:id',
    element: <ReportEditorStream />,
  },
];

export default routes;

