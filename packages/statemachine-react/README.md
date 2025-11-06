# @cyoda/statemachine-react

State Machine Management application for Cyoda platform - React implementation.

## Overview

This package provides a complete state machine management interface for creating and managing workflows, states, transitions, criteria, and processes. It's migrated from the Vue-based `@cyoda/statemachine` package.

## Features

- **Workflow Management**: Create, edit, copy, and delete workflows
- **State Management**: Define states within workflows
- **Transition Management**: Configure transitions between states
- **Criteria Management**: Define conditions for transitions
- **Process Management**: Configure processes to execute during transitions
- **Instance Tracking**: View and manage state machine instances
- **Graphical View**: Visual representation of state machines (coming soon)

## Installation

```bash
npm install @cyoda/statemachine-react
```

## Usage

### As a Standalone Application

```bash
npm run dev
```

The application will be available at `http://localhost:3014`

### As a Package

```typescript
import { Workflows, Instances, useStatemachineStore } from '@cyoda/statemachine-react';

function MyApp() {
  return (
    <div>
      <Workflows />
    </div>
  );
}
```

## Available Hooks

### Workflow Hooks
- `useWorkflowsList(entityClassName?)` - Get all workflows
- `useWorkflow(persistedType, workflowId)` - Get a single workflow
- `useCreateWorkflow()` - Create a new workflow
- `useUpdateWorkflow()` - Update a workflow
- `useDeleteWorkflow()` - Delete a workflow
- `useCopyWorkflow()` - Copy a workflow

### State Hooks
- `useStatesList(persistedType, workflowId)` - Get all states for a workflow
- `useState(persistedType, workflowId, stateId)` - Get a single state
- `useCreateState()` - Create a new state
- `useUpdateState()` - Update a state
- `useDeleteState()` - Delete a state

### Transition Hooks
- `useTransitionsList(persistedType, workflowId)` - Get all transitions
- `useTransition(persistedType, workflowId, transitionId)` - Get a single transition
- `useCreateTransition()` - Create a transition
- `useUpdateTransition()` - Update a transition
- `useDeleteTransition()` - Delete a transition

### Criteria Hooks
- `useCriteriaList(entityClassName?)` - Get all criteria
- `useCriteria(persistedType, criteriaId, entityClassName?)` - Get a single criteria
- `useCreateCriteria()` - Create criteria
- `useUpdateCriteria()` - Update criteria
- `useDeleteCriteria()` - Delete criteria

### Process Hooks
- `useProcessesList(entityClassName?)` - Get all processes
- `useProcess(persistedType, processId, entityClassName?)` - Get a single process
- `useCreateProcess()` - Create a process
- `useUpdateProcess()` - Update a process
- `useDeleteProcess()` - Delete a process

### Instance Hooks
- `useInstances()` - Query instances

## Store

The package uses Zustand for state management with localStorage persistence:

```typescript
import { useStatemachineStore } from '@cyoda/statemachine-react';

function MyComponent() {
  const store = useStatemachineStore();
  const selectedWorkflow = store.selectedWorkflow;
  
  // Set selected workflow
  store.setSelectedWorkflow(workflow);
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check
```

## Architecture

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Query** - Server state management
- **Zustand** - Client state management
- **Ant Design** - UI components
- **React Router** - Routing
- **Vite** - Build tool

## Migration Status

This package is currently **in progress** (40% complete). Completed features:

- ✅ TypeScript types
- ✅ Zustand stores
- ✅ React Query hooks (all 30+ hooks)
- ✅ Workflows page
- ✅ Instances page
- ✅ Routes configuration
- ✅ App setup

Coming soon:
- Workflow detail page with graphical view
- State, Transition, Criteria, Process forms
- Instance detail view
- Export/Import functionality
- Advanced filtering

## License

Proprietary - Cyoda

