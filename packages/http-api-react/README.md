# @cyoda/http-api-react

React hooks and utilities for Cyoda HTTP API operations.

## Features

- 🎣 **React Hooks** - Custom hooks for all API operations
- 🔄 **React Query Integration** - Built-in caching, refetching, and state management
- 🔐 **Authentication** - Complete auth flow with token management
- 📊 **Reports** - Comprehensive report operations
- 🗂️ **Entities** - Full CRUD operations for entities
- ⚙️ **Configuration** - System configuration and management
- 🛡️ **Type Safety** - Full TypeScript support
- ✅ **Tested** - Comprehensive test coverage

## Installation

```bash
npm install @cyoda/http-api-react
```

## Quick Start

### 1. Wrap your app with QueryProvider

```tsx
import { QueryProvider } from '@cyoda/http-api-react';

function App() {
  return (
    <QueryProvider showDevtools={true}>
      <YourApp />
    </QueryProvider>
  );
}
```

### 2. Use hooks in your components

```tsx
import { useAuth, useReportHistory } from '@cyoda/http-api-react';

function MyComponent() {
  const { login, isAuthenticated, user } = useAuth();
  const { data: reports, isLoading } = useReportHistory({
    params: { size: 10 }
  });

  const handleLogin = () => {
    login({ username: 'user@example.com', password: 'password' });
  };

  if (!isAuthenticated) {
    return <button onClick={handleLogin}>Login</button>;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <ul>
        {reports?._embedded?.itemHistories?.map(report => (
          <li key={report.reportHistoryFields.id}>
            {report.reportHistoryFields.configName}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### Authentication Hooks

#### `useAuth()`

Main authentication hook with complete auth functionality.

```tsx
const {
  // State
  isAuthenticated,
  user,
  permissions,
  isLoadingUser,
  
  // Actions
  login,
  logout,
  changePassword,
  
  // Helpers
  hasPermission,
  getToken,
} = useAuth();
```

**Example:**

```tsx
function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ 
      username: e.target.username.value, 
      password: e.target.password.value 
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button disabled={isLoggingIn}>Login</button>
      {loginError && <div>Error: {loginError.message}</div>}
    </form>
  );
}
```

#### `usePermission(permission: string)`

Check if user has a specific permission.

```tsx
const { hasPermission, isLoading } = usePermission('admin.users.write');

if (hasPermission) {
  return <AdminPanel />;
}
```

### Report Hooks

#### `useReportHistory(args, options?)`

Get report history with pagination.

```tsx
const { data, isLoading, error, refetch } = useReportHistory({
  params: {
    username: 'user@example.com',
    size: 20,
    page: 0,
  }
});
```

#### `useReportStatus(reportId, options?)`

Get report status with auto-refresh for running reports.

```tsx
const { data: status } = useReportStatus(reportId);

// Automatically refetches every 2 seconds while report is running
if (status?.content?.status === 'RUNNING') {
  return <ProgressBar />;
}
```

#### `useCreateReport()`

Create a new report.

```tsx
const { mutate: createReport, isPending } = useCreateReport();

const handleCreate = () => {
  createReport(reportConfig, {
    onSuccess: (data) => {
      console.log('Report created:', data);
    }
  });
};
```

#### `useDeleteReport()`

Delete a report.

```tsx
const { mutate: deleteReport } = useDeleteReport();

const handleDelete = (reportId) => {
  deleteReport(reportId);
};
```

### Entity Hooks

#### `useEntity(entityClass, entityId, params?, options?)`

Get a single entity.

```tsx
const { data: entity, isLoading } = useEntity(
  'com.cyoda.model.User',
  'user-123'
);
```

#### `useSearchEntities(entityClass, searchParams, options?)`

Search for entities.

```tsx
const { data: results } = useSearchEntities(
  'com.cyoda.model.Transaction',
  {
    status: 'COMPLETED',
    size: 50,
  }
);
```

#### `useCreateEntity()`

Create a new entity.

```tsx
const { mutate: createEntity } = useCreateEntity();

const handleCreate = () => {
  createEntity({
    entityClass: 'com.cyoda.model.User',
    entityId: 'new-user',
    values: [
      { columnPath: 'name', value: 'John Doe' },
      { columnPath: 'email', value: 'john@example.com' },
    ],
  });
};
```

#### `useUpdateEntity()`

Update an existing entity.

```tsx
const { mutate: updateEntity } = useUpdateEntity();

const handleUpdate = () => {
  updateEntity({
    entityClass: 'com.cyoda.model.User',
    entityId: 'user-123',
    entityRequest: {
      values: [
        { columnPath: 'name', value: 'Jane Doe' },
      ],
    },
  });
};
```

### Configuration Hooks

#### `useDefinitions(params?, options?)`

Get all report definitions.

```tsx
const { data: definitions } = useDefinitions({
  fields: ['id', 'description'],
});
```

#### `useServerInfo(options?)`

Get server information.

```tsx
const { data: serverInfo } = useServerInfo();

console.log(serverInfo?.version);
```

#### `useSystemHealth(options?)`

Get system health status with auto-refresh.

```tsx
const { data: health } = useSystemHealth();

// Automatically refetches every minute
if (health?.status === 'DOWN') {
  return <Alert>System is down!</Alert>;
}
```

#### `useFeatureFlags(options?)`

Get feature flags.

```tsx
const { data: flags } = useFeatureFlags();

if (flags?.newFeature) {
  return <NewFeatureComponent />;
}
```

## Advanced Usage

### Custom Query Options

All query hooks accept React Query options:

```tsx
const { data } = useReportHistory(
  { params: { size: 10 } },
  {
    enabled: isAuthenticated, // Only run when authenticated
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      console.log('Data loaded:', data);
    },
  }
);
```

### Optimistic Updates

```tsx
const { mutate: updateEntity } = useUpdateEntity();

updateEntity(
  { entityClass, entityId, entityRequest },
  {
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['entities', entityClass, entityId]);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['entities', entityClass, entityId]);
      
      // Optimistically update
      queryClient.setQueryData(['entities', entityClass, entityId], (old) => ({
        ...old,
        ...variables.entityRequest,
      }));
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['entities', variables.entityClass, variables.entityId],
        context.previous
      );
    },
  }
);
```

### Direct API Access

If you need to call APIs directly without hooks:

```tsx
import { getReportStatus, createEntity } from '@cyoda/http-api-react';

// In an async function
const response = await getReportStatus('report-123');
console.log(response.data);
```

## Environment Variables

Configure API endpoints via environment variables:

```env
VITE_APP_API_BASE=https://api.example.com
VITE_APP_API_BASE_PROCESSING=https://processing.example.com
VITE_APP_GRAFANA_API_URL=https://grafana.example.com
VITE_APP_AI_BASE=https://ai.example.com
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  ReportHistory, 
  Entity, 
  User, 
  IReportStatus 
} from '@cyoda/http-api-react';

const reports: ReportHistory = await getHistory({ params: {} });
```

## Testing

The package includes comprehensive tests. Run them with:

```bash
npm test
```

## License

Proprietary - Cyoda

