/**
 * Tableau React - Routes Configuration
 * Migrated from: .old_project/packages/tableau/src/router/index.ts
 */

import { RouteObject } from 'react-router-dom';
import Reports from '@/pages/Reports';
import ReportConfigs from '@/pages/ReportConfigs';
import ReportEditor from '@/pages/ReportEditor';
import StreamReports from '@/pages/StreamReports';
import StreamReportEditor from '@/pages/StreamReportEditor';

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
    element: <Reports />, // Main Reports page with tabs (Report Config + Reports)
  },
  {
    path: '/tableau/report-editor/:id',
    element: <ReportEditor />,
  },
  {
    path: '/tableau/stream-reports',
    element: <StreamReports />,
  },
  {
    path: '/tableau/stream-report-editor/:id',
    element: <StreamReportEditor />,
  },
];

export default routes;

