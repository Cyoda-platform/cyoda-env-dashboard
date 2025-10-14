/**
 * Routes Configuration
 * Migrated from @cyoda/processing-manager/src/router/routes.ts
 */

import { RouteObject, Navigate } from 'react-router-dom';
import { Login } from '@cyoda/ui-lib-react';

// Lazy load pages for code splitting
import { lazy } from 'react';

const Home = lazy(() => import('../pages/Home'));
const Nodes = lazy(() => import('../pages/Nodes'));
const NodesDetail = lazy(() => import('../pages/NodesDetail'));
const TransactionDetail = lazy(() => import('../pages/TransactionDetail'));
const TransitionVersions = lazy(() => import('../pages/TransitionVersions'));
const TransitionChanges = lazy(() => import('../pages/TransitionChanges'));
const TransitionEntityStateMachine = lazy(() => import('../pages/TransitionEntityStateMachine'));
const EventView = lazy(() => import('../pages/EventView'));
const Page404 = lazy(() => import('../pages/Page404'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/processing-ui" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/processing-ui',
    element: <Home />,
  },
  {
    path: '/processing-ui/nodes',
    element: <Nodes />,
  },
  {
    path: '/processing-ui/nodes/:name',
    element: <NodesDetail />,
  },
  {
    path: '/processing-ui/nodes/:name/transaction/:transactionId',
    element: <TransactionDetail />,
  },
  {
    path: '/processing-ui/nodes/:name/versions',
    element: <TransitionVersions />,
  },
  {
    path: '/processing-ui/nodes/:name/changes',
    element: <TransitionChanges />,
  },
  {
    path: '/processing-ui/nodes/:name/entity-state-machine',
    element: <TransitionEntityStateMachine />,
  },
  {
    path: '/processing-ui/nodes/:name/event-view',
    element: <EventView />,
  },
  {
    path: '/404',
    element: <Page404 />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

export default routes;

