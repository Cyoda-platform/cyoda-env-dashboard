# @cyoda/tasks-react

Cyoda Tasks Management Application - React Version

## Features

- 📋 **Task Management** - View, filter, and manage tasks
- 🔍 **Advanced Filtering** - Filter by status, assignee, and priority
- 📊 **Real-time Updates** - Subscribe to live task updates via SSE
- ✏️ **Task Editing** - Edit task details and transitions
- 📈 **Statistics** - View task statistics and summaries
- 🎨 **Modern UI** - Built with Ant Design components
- 🔐 **Authentication** - Integrated with Cyoda auth system

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3010`

## Build

```bash
npm run build
```

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── TasksFilter.tsx
│   └── TasksGrid.tsx
├── pages/           # Page components
│   ├── Tasks.tsx
│   └── TaskDetail.tsx
├── hooks/           # Custom React hooks
│   └── useTasks.ts
├── stores/          # Zustand stores
│   └── tasksStore.ts
├── routes/          # Route configuration
│   └── index.tsx
├── types/           # TypeScript types
│   └── index.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Usage

### Tasks List Page

The main tasks page displays a filterable, paginated list of tasks:

```tsx
import { Tasks } from '@cyoda/tasks-react';

<Tasks />
```

### Task Detail Page

View and edit individual task details:

```tsx
import { TaskDetail } from '@cyoda/tasks-react';

<TaskDetail />
```

### Using Tasks Hooks

```tsx
import { useTasksPerPage, useTask, useUpdateTask } from '@cyoda/tasks-react';

function MyComponent() {
  // Get paginated tasks
  const { data, isLoading } = useTasksPerPage({
    page: 0,
    size: 10,
    state: 'OPEN',
  });

  // Get single task
  const { data: task } = useTask('task-id');

  // Update task
  const { mutate: updateTask } = useUpdateTask();
}
```

## Dependencies

- **@cyoda/http-api-react** - HTTP API layer
- **@cyoda/ui-lib-react** - Shared UI components
- **React Query** - Server state management
- **Zustand** - Client state management
- **Ant Design** - UI components
- **React Router** - Routing

## License

Proprietary - Cyoda

