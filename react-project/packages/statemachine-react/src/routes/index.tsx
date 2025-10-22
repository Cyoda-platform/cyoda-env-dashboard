/**
 * Routes Configuration
 * Migrated from: .old_project/packages/statemachine/src/router/routes.ts
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Login } from '@cyoda/ui-lib-react';
import { Menu } from '../pages/Menu';
import { Workflows } from '../pages/Workflows';
import { Instances } from '../pages/Instances';
import { InstanceDetail } from '../pages/InstanceDetail';
import { WorkflowDetail } from '../pages/WorkflowDetail';
import { State } from '../pages/State';
import { Transition } from '../pages/Transition';
import { Criteria } from '../pages/Criteria';
import { Process } from '../pages/Process';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/menu',
    element: <Menu />,
  },
  {
    path: '/workflows',
    element: <Workflows />,
  },
  {
    path: '/instances',
    element: <Instances />,
  },
  {
    path: '/workflow/new',
    element: <WorkflowDetail />,
  },
  {
    path: '/workflow/:workflowId',
    element: <WorkflowDetail />,
  },
  {
    path: '/state/:stateId',
    element: <State />,
  },
  {
    path: '/transition/:transitionId',
    element: <Transition />,
  },
  {
    path: '/criteria/:criteriaId',
    element: <Criteria />,
  },
  {
    path: '/process/:processId',
    element: <Process />,
  },
  {
    path: '/instances/:instanceId',
    element: <InstanceDetail />,
  },
];

export default routes;

