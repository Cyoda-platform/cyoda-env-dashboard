/**
 * Routes Configuration
 * Migrated from: .old_project/packages/statemachine/src/router/routes.ts
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Login, Home } from '@cyoda/ui-lib-react';
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
    element: <Home />,
  },
  {
    path: '/',
    element: <Workflows />,
  },
  {
    path: '/statemachine/workflows',
    element: <Workflows />,
  },
  {
    path: '/statemachine/instances',
    element: <Instances />,
  },
  {
    path: '/statemachine/workflow/new',
    element: <WorkflowDetail />,
  },
  {
    path: '/statemachine/workflow/:workflowId',
    element: <WorkflowDetail />,
  },
  {
    path: '/statemachine/state/:stateId',
    element: <State />,
  },
  {
    path: '/statemachine/transition/:transitionId',
    element: <Transition />,
  },
  {
    path: '/statemachine/criteria/:criteriaId',
    element: <Criteria />,
  },
  {
    path: '/statemachine/process/:processId',
    element: <Process />,
  },
  {
    path: '/statemachine/instances/:instanceId',
    element: <InstanceDetail />,
  },
];

export default routes;

