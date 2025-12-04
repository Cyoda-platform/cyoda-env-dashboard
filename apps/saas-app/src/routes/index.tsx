import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { HelperFeatureFlags } from '@cyoda/http-api-react';

// Lazy load package components for better performance
const TrinoIndex = React.lazy(() => import('@cyoda/cyoda-sass-react').then(m => ({ default: m.TrinoIndex })));
const TrinoEdit = React.lazy(() => import('@cyoda/cyoda-sass-react').then(m => ({ default: m.TrinoEdit })));

const Reports = React.lazy(() => import('@cyoda/tableau-react').then(m => ({ default: m.Reports })));
const ReportEditor = React.lazy(() => import('@cyoda/tableau-react').then(m => ({ default: m.ReportEditor })));
const ReportConfigsStream = React.lazy(() => import('@cyoda/tableau-react').then(m => ({ default: m.ReportConfigsStream })));
const ReportEditorStream = React.lazy(() => import('@cyoda/tableau-react').then(m => ({ default: m.ReportEditorStream })));
const CatalogueOfAliases = React.lazy(() => import('@cyoda/tableau-react').then(m => ({ default: m.CatalogueOfAliases })));

const Workflows = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.Workflows })));
const WorkflowDetail = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.WorkflowDetail })));
const Instances = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.Instances })));
const InstanceDetail = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.InstanceDetail })));
const State = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.State })));
const Transition = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.Transition })));
const Criteria = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.Criteria })));
const Process = React.lazy(() => import('@cyoda/statemachine-react').then(m => ({ default: m.Process })));

const Tasks = React.lazy(() => import('@cyoda/tasks-react').then(m => ({ default: m.Tasks })));
const TaskDetail = React.lazy(() => import('@cyoda/tasks-react').then(m => ({ default: m.TaskDetail })));

const PageEntityViewer = React.lazy(() => import('@cyoda/http-api-react').then(m => ({ default: m.PageEntityViewer })));

const ProcessingHome = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.Home })));
const ProcessingNodes = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.Nodes })));
const ProcessingNodesDetail = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.NodesDetail })));
const TransactionDetail = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.TransactionDetail })));
const TransitionVersions = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.TransitionVersions })));
const TransitionChanges = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.TransitionChanges })));
const TransitionEntityStateMachine = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.TransitionEntityStateMachine })));
const EventView = React.lazy(() => import('@cyoda/processing-manager-react').then(m => ({ default: m.EventView })));

// Login page (simple placeholder for now)
const Login = React.lazy(() => import('../pages/Login'));

export const AppRoutes: React.FC = () => {
  const isTrinoEnabled = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
  const isTasksEnabled = HelperFeatureFlags.isTasksEnabled();
  const defaultRoute = isTrinoEnabled ? '/trino' : '/tableau/reports';

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Main App Routes with Layout */}
      <Route path="/" element={<AppLayout />}>
        {/* Default redirect */}
        <Route index element={<Navigate to={defaultRoute} replace />} />

        {/* Trino SQL Schemas - conditionally rendered based on feature flag */}
        {isTrinoEnabled && (
          <>
            <Route path="trino" element={<TrinoIndex />} />
            <Route path="trino/schema" element={<TrinoEdit />} />
            <Route path="trino/schema/:id" element={<TrinoEdit />} />
          </>
        )}

        {/* Reporting - Tableau */}
        <Route path="tableau/reports" element={<Reports />} />
        <Route path="tableau/report-editor/:id" element={<ReportEditor />} />
        <Route path="tableau/reports/stream" element={<ReportConfigsStream />} />
        <Route path="tableau/reports/stream/:id" element={<ReportEditorStream />} />
        <Route path="tableau/catalogue-of-aliases" element={<CatalogueOfAliases />} />

        {/* Lifecycle - Statemachine */}
        <Route path="workflows" element={<Workflows />} />
        <Route path="workflow/new" element={<WorkflowDetail />} />
        <Route path="workflow/:workflowId" element={<WorkflowDetail />} />
        <Route path="instances" element={<Instances />} />
        <Route path="instances/:instanceId" element={<InstanceDetail />} />
        <Route path="state/:stateId" element={<State />} />
        <Route path="transition/:transitionId" element={<Transition />} />
        <Route path="criteria/:criteriaId" element={<Criteria />} />
        <Route path="process/:processId" element={<Process />} />

        {/* Tasks - conditionally rendered based on feature flag */}
        {isTasksEnabled && (
          <>
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
          </>
        )}

        {/* Entity Viewer */}
        <Route path="entity-viewer" element={<PageEntityViewer />} />

        {/* Processing Manager */}
        <Route path="processing" element={<Navigate to="/processing-ui" replace />} />
        <Route path="processing-ui" element={<ProcessingHome />} />
        <Route path="processing-ui/nodes" element={<ProcessingNodes />} />
        <Route path="processing-ui/nodes/:name" element={<ProcessingNodesDetail />} />
        <Route path="processing-ui/nodes/:name/transaction/:transactionId" element={<TransactionDetail />} />
        <Route path="processing-ui/nodes/:name/versions" element={<TransitionVersions />} />
        <Route path="processing-ui/nodes/:name/changes" element={<TransitionChanges />} />
        <Route path="processing-ui/nodes/:name/entity-state-machine" element={<TransitionEntityStateMachine />} />
        <Route path="processing-ui/nodes/:name/event-view" element={<EventView />} />

        {/* Catch all - redirect to default route */}
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Route>
    </Routes>
  );
};

