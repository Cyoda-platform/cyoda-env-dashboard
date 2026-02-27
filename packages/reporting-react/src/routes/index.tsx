/**
 * Reporting React - Routes Configuration
 */

import { RouteObject } from 'react-router-dom';
import Reports from '@/pages/Reports';
import ReportEditor from '@/pages/ReportEditor';
import ReportConfigsStream from '@/pages/ReportConfigsStream';
import ReportEditorStream from '@/pages/ReportEditorStream';
import CatalogueOfAliases from '@/pages/CatalogueOfAliases';

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
    path: '/reporting/login',
    element: <Login />,
  },
  {
    path: '/reporting/reports',
    element: <Reports />, // Main Reports page with tabs (Report Config + Reports History)
  },
  {
    path: '/reporting/reports/stream',
    element: <ReportConfigsStream />, // Stream Reports page (separate from Reports)
  },
  {
    path: '/reporting/report-editor/:id',
    element: <ReportEditor />,
  },
  {
    path: '/reporting/reports/stream/:id',
    element: <ReportEditorStream />,
  },
  {
    path: '/reporting/catalogue-of-aliases',
    element: <CatalogueOfAliases />,
  },
];

export default routes;

