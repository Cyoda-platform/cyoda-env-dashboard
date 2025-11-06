# API Hooks Documentation

Complete reference for all React Query hooks in the Processing Manager package.

## Table of Contents

- [Overview](#overview)
- [Query Keys](#query-keys)
- [Cluster & Nodes](#cluster--nodes)
- [Process Events](#process-events)
- [Statistics](#statistics)
- [Transactions](#transactions)
- [Entity Management](#entity-management)
- [Service Processes](#service-processes)
- [Execution Monitors](#execution-monitors)
- [Processing Queues](#processing-queues)
- [Mutations](#mutations)
- [Grafana](#grafana)

## Overview

All hooks are built on React Query and provide:
- Automatic caching and background refetching
- Request deduplication
- Loading and error states
- Optimistic updates (mutations)
- Type safety with TypeScript

### Basic Usage Pattern

```typescript
import { useClusterStats } from '@cyoda/processing-manager-react';

function MyComponent() {
  const { data, isLoading, error, refetch } = useClusterStats();
  
  if (isLoading) return <Spin />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Use data */}</div>;
}
```

## Query Keys

All query keys are exported from `processingKeys` for cache management:

```typescript
import { processingKeys } from '@cyoda/processing-manager-react';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  // Invalidate all processing queries
  queryClient.invalidateQueries({ queryKey: processingKeys.all });
  
  // Invalidate specific query
  queryClient.invalidateQueries({ queryKey: processingKeys.clusterStats() });
}
```

## Cluster & Nodes

### `useClusterStats()`

Fetches cluster-wide statistics including all processing nodes.

**Returns:** `UseQueryResult<PmClusterStats>`

**Example:**
```typescript
const { data, isLoading } = useClusterStats();

// data.pmNodes - Array of processing nodes
// data.activeTransactions - Number of active transactions
// data.totalProcessed - Total processed entities
```

### `useSummary(params)`

Fetches processing summary for a specific node or time period.

**Parameters:**
- `params.node` (string, optional) - Node hostname
- `params.dateFrom` (string, optional) - Start date
- `params.dateTo` (string, optional) - End date

**Returns:** `UseQueryResult<ProcessingSummary>`

**Example:**
```typescript
const { data } = useSummary({ 
  node: 'node-01',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});
```

## Process Events

### `useProcessEventsStats(params)`

Fetches statistics about process events.

**Parameters:**
- `params.eventType` (string, optional) - Event type filter
- `params.page` (number, optional) - Page number
- `params.pageSize` (number, optional) - Items per page

**Returns:** `UseQueryResult<ProcessEvent[]>`

### `usePollingInfo(params)`

Fetches polling information for processing queues.

**Returns:** `UseQueryResult<PollingInfo>`

### `useProcessingQueueEvents(params)`

Fetches events from processing queues.

**Returns:** `UseQueryResult<ProcessEvent[]>`

## Statistics

### `useStatsTime(params)`

Fetches time-based statistics (hourly, daily, weekly).

**Parameters:**
- `params.period` (string) - Time period ('hour', 'day', 'week')
- `params.dateFrom` (string) - Start date
- `params.dateTo` (string) - End date

**Returns:** `UseQueryResult<TimeStats[]>`

**Example:**
```typescript
const { data } = useStatsTime({
  period: 'day',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});

// data - Array of time-based statistics
```

### `useStatsCount(params)`

Fetches count-based statistics with aggregations.

**Parameters:**
- `params.groupBy` (string) - Grouping field
- `params.filters` (object) - Additional filters

**Returns:** `UseQueryResult<CountStats[]>`

## Transactions

### `useTransactions(params)`

Fetches paginated list of transactions.

**Parameters:**
- `params.page` (number) - Page number (default: 1)
- `params.pageSize` (number) - Items per page (default: 20)
- `params.status` (string, optional) - Filter by status
- `params.search` (string, optional) - Search query

**Returns:** `UseQueryResult<PaginatedResponse<Transaction>>`

**Example:**
```typescript
const { data, isLoading } = useTransactions({
  page: 1,
  pageSize: 20,
  status: 'COMPLETED'
});

// data.items - Array of transactions
// data.total - Total count
// data.page - Current page
// data.pageSize - Items per page
```

### `useTransaction(id)`

Fetches a single transaction by ID.

**Parameters:**
- `id` (string) - Transaction ID

**Returns:** `UseQueryResult<Transaction>`

**Example:**
```typescript
const { data } = useTransaction('tx-123');

// data.id - Transaction ID
// data.status - Transaction status
// data.startTime - Start timestamp
// data.endTime - End timestamp
```

### `useTransactionMembers(id, params)`

Fetches members of a transaction with pagination.

**Parameters:**
- `id` (string) - Transaction ID
- `params.page` (number) - Page number
- `params.pageSize` (number) - Items per page
- `params.entityType` (string, optional) - Filter by entity type
- `params.operation` (string, optional) - Filter by operation

**Returns:** `UseQueryResult<PaginatedResponse<TransactionMember>>`

**Example:**
```typescript
const { data } = useTransactionMembers('tx-123', {
  page: 1,
  pageSize: 10,
  entityType: 'ORDER'
});
```

### `useTransactionEvents(id, params)`

Fetches events for a transaction.

**Parameters:**
- `id` (string) - Transaction ID
- `params.page` (number) - Page number
- `params.pageSize` (number) - Items per page
- `params.eventType` (string, optional) - Filter by event type

**Returns:** `UseQueryResult<PaginatedResponse<TransactionEvent>>`

### `useTransactionStatuses()`

Fetches available transaction statuses.

**Returns:** `UseQueryResult<string[]>`

## Entity Management

### `useEntityVersions(params)`

Fetches version history for an entity.

**Parameters:**
- `params.entityType` (string) - Entity type
- `params.entityId` (string) - Entity ID

**Returns:** `UseQueryResult<EntityVersion[]>`

**Example:**
```typescript
const { data } = useEntityVersions({
  entityType: 'ORDER',
  entityId: 'order-123'
});

// data - Array of entity versions
```

### `useEntityChanges(params)`

Fetches changes for a specific entity version.

**Parameters:**
- `params.entityType` (string) - Entity type
- `params.entityId` (string) - Entity ID
- `params.version` (number) - Version number

**Returns:** `UseQueryResult<EntityChange[]>`

**Example:**
```typescript
const { data } = useEntityChanges({
  entityType: 'ORDER',
  entityId: 'order-123',
  version: 2
});

// data - Array of field changes with old/new values
```

### `useEntityStateMachine(params)`

Fetches state machine definition for an entity type.

**Parameters:**
- `params.entityType` (string) - Entity type

**Returns:** `UseQueryResult<EntityStateMachine>`

**Example:**
```typescript
const { data } = useEntityStateMachine({
  entityType: 'ORDER'
});

// data.states - Available states
// data.transitions - Allowed transitions
```

## Mutations

### `useManualTransition()`

Performs a manual state transition for an entity.

**Returns:** `UseMutationResult`

**Example:**
```typescript
const mutation = useManualTransition();

const handleTransition = async () => {
  try {
    await mutation.mutateAsync({
      entityId: 'entity-123',
      targetState: 'PROCESSED'
    });
    message.success('Transition successful');
  } catch (error) {
    message.error('Transition failed');
  }
};

// Check mutation state
if (mutation.isPending) return <Spin />;
```

### `useForceMarkProcessed()`

Forces an entity to be marked as processed.

**Returns:** `UseMutationResult`

**Example:**
```typescript
const mutation = useForceMarkProcessed();

mutation.mutate({
  entityId: 'entity-123'
});
```

## Grafana

### `useGrafanaDashboardByName(name)`

Fetches Grafana dashboard by name.

**Parameters:**
- `name` (string) - Dashboard name

**Returns:** `UseQueryResult<GrafanaDashboard>`

### `useGrafanaPanelsByUid(uid)`

Fetches Grafana panels by dashboard UID.

**Parameters:**
- `uid` (string) - Dashboard UID

**Returns:** `UseQueryResult<GrafanaPanel[]>`

---

**Last Updated:** 2025-10-14  
**Version:** 1.0.0

