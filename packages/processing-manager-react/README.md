# @cyoda/processing-manager-react

> **Processing Manager** - Enterprise-grade data processing and batch operations management system

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Tests-220%20passing-success.svg)](#testing)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](#testing)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Processing Manager is a comprehensive React application for monitoring and managing distributed data processing operations across multiple nodes. It provides real-time insights into transaction processing, performance metrics, and system health.

### Key Capabilities

- **🖥️ Node/Shard Monitoring** - Real-time monitoring of processing nodes and their operational status
- **📊 Transaction Tracking** - Comprehensive transaction lifecycle management and tracking
- **📈 Performance Metrics** - Advanced statistics, charts, and performance analytics
- **🔍 Grafana Integration** - Seamless integration with Grafana for advanced monitoring dashboards
- **🔐 SSH Connectivity** - Secure SSH connections to nodes for direct management
- **⚡ Real-time Updates** - Live data updates using React Query with automatic polling
- **💾 State Persistence** - User preferences and settings persisted across sessions
- **🎨 Modern UI** - Built with Ant Design for a polished, professional interface

## ✨ Features

### Transaction Management
- View transaction details with status, duration, and timestamps
- Track transaction members with filtering and search
- Monitor transaction events with detailed event logs
- Filter by entity type, operation, and status
- Export transaction data

### Node Monitoring
- Real-time cluster statistics and health metrics
- Individual node details with performance graphs
- CPU usage and disk I/O monitoring
- Service process tracking
- Execution queue monitoring

### Entity Management
- Entity version history tracking
- Entity change diff visualization
- State machine visualization
- Manual state transitions
- Entity error tracking and resolution

### Analytics & Reporting
- Time-based statistics (hourly, daily, weekly)
- Count-based statistics with aggregations
- Custom date range selection
- Interactive Chart.js visualizations
- Grafana dashboard embedding

## 📦 Installation

### Prerequisites

- Node.js 18+ or 20+
- npm 9+ or yarn 1.22+

### Install Dependencies

From the workspace root:

```bash
npm install
```

Or from the package directory:

```bash
cd react-project/packages/processing-manager-react
npm install
```

## 🚀 Quick Start

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:3008`

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized build will be output to the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## ⚙️ Configuration

### Environment Configuration

The application loads configuration from `public/config.json`:

```json
{
  "apiBaseUrl": "http://localhost:8080",
  "grafanaUrl": "http://localhost:3000",
  "enableSSH": true,
  "pollingInterval": 30000
}
```

### Available Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBaseUrl` | string | - | Base URL for the Processing Manager API |
| `grafanaUrl` | string | - | Grafana instance URL for dashboard integration |
| `enableSSH` | boolean | `true` | Enable/disable SSH connectivity features |
| `pollingInterval` | number | `30000` | Polling interval for real-time updates (ms) |

### Store Persistence

User preferences are automatically persisted to localStorage:

- **App Store**: Node selection, base URL, proxy settings, sidebar state
- **Grafana Store**: Selected charts and dashboard preferences

To clear persisted data:

```typescript
import { useAppStore, useGrafanaStore } from '@cyoda/processing-manager-react';

// Reset to defaults
useAppStore.getState().reset();
useGrafanaStore.getState().reset();
```

## 📚 Usage

### Basic Example

```typescript
import { useClusterStats, useProcessingStore } from '@cyoda/processing-manager-react';
import { Spin } from 'antd';

function NodesPage() {
  const { data, isLoading, error } = useClusterStats();
  const selectedNode = useProcessingStore((state) => state.selectedNode);

  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Processing Nodes</h1>
      <p>Total Nodes: {data?.totalNodes}</p>
      <p>Running: {data?.runningNodes}</p>
      <p>Selected: {selectedNode || 'None'}</p>
    </div>
  );
}
```

### Using Stores

#### App Store

```typescript
import { useAppStore } from '@cyoda/processing-manager-react';

function MyComponent() {
  // Subscribe to specific state
  const node = useAppStore((state) => state.node);
  const baseUrl = useAppStore((state) => state.baseUrl);

  // Access actions
  const setNode = useAppStore((state) => state.setNode);
  const toggleSidebar = useAppStore((state) => state.sideBarToggle);

  return (
    <div>
      <p>Current Node: {node}</p>
      <button onClick={() => setNode('node-01')}>Select Node 01</button>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  );
}
```

#### Processing Store

```typescript
import { useProcessingStore } from '@cyoda/processing-manager-react';

function NodesList() {
  const nodes = useProcessingStore((state) => state.nodes);
  const loading = useProcessingStore((state) => state.loading);
  const setSelectedNode = useProcessingStore((state) => state.setSelectedNode);

  if (loading) return <Spin />;

  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.hostname} onClick={() => setSelectedNode(node.hostname)}>
          {node.hostname}
        </li>
      ))}
    </ul>
  );
}
```

### Using React Query Hooks

#### Fetching Data

```typescript
import { useTransactions, useTransaction } from '@cyoda/processing-manager-react';

function TransactionsList() {
  const { data, isLoading, error, refetch } = useTransactions({
    page: 1,
    pageSize: 20,
    status: 'COMPLETED'
  });

  if (isLoading) return <Spin />;
  if (error) return <div>Error loading transactions</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.items.map((tx) => (
          <li key={tx.id}>{tx.id} - {tx.status}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Mutations

```typescript
import { useManualTransition } from '@cyoda/processing-manager-react';
import { message } from 'antd';

function EntityActions({ entityId }: { entityId: string }) {
  const mutation = useManualTransition();

  const handleTransition = async () => {
    try {
      await mutation.mutateAsync({
        entityId,
        targetState: 'PROCESSED'
      });
      message.success('Transition successful');
    } catch (error) {
      message.error('Transition failed');
    }
  };

  return (
    <button
      onClick={handleTransition}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Processing...' : 'Mark as Processed'}
    </button>
  );
}
```

### Using Components

```typescript
import {
  TransactionStatistics,
  TransactionMembersTable,
  GrafanaChart
} from '@cyoda/processing-manager-react';

function TransactionDetailPage({ transactionId }: { transactionId: string }) {
  return (
    <div>
      <TransactionStatistics transactionId={transactionId} />
      <TransactionMembersTable transactionId={transactionId} />
      <GrafanaChart
        dashboardName="processing-metrics"
        panelName="transaction-throughput"
        node="node-01"
        port="9090"
        job="processing"
      />
    </div>
  );
}
```

## 🔌 API Reference

### Stores

#### `useAppStore`

Global application state management.

**State:**
- `node: string` - Currently selected node
- `baseUrl: string` - API base URL
- `proxyRequest: boolean` - Enable proxy for requests
- `loading: boolean` - Global loading state
- `error: string | null` - Global error message
- `sideBarIsShow: boolean` - Sidebar visibility
- `sideBarIsMinimize: boolean` - Sidebar minimized state

**Actions:**
- `setNode(node: string)` - Set selected node
- `setBaseUrl(url: string)` - Set API base URL
- `setProxyRequest(enabled: boolean)` - Toggle proxy
- `setLoading(loading: boolean)` - Set loading state
- `setError(error: string | null)` - Set error message
- `sideBarToggle()` - Toggle sidebar visibility
- `sideBarMinimizeToggle()` - Toggle sidebar minimize
- `reset()` - Reset to initial state

#### `useProcessingStore`

Processing nodes state management.

**State:**
- `nodes: PmNode[]` - List of all nodes
- `nodesProcessing: PmNode[]` - Processing nodes
- `selectedNode: string | null` - Selected node hostname
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Actions:**
- `setNodes(nodes: PmNode[])` - Set nodes list
- `setNodesProcessing(nodes: PmNode[])` - Set processing nodes
- `setSelectedNode(hostname: string)` - Set selected node
- `setLoading(loading: boolean)` - Set loading state
- `setError(error: string | null)` - Set error message
- `reset()` - Reset to initial state

#### `useGrafanaStore`

Grafana charts state management.

**State:**
- `charts: GrafanaChart[]` - List of charts
- `selectedChart: string | null` - Selected chart ID

**Actions:**
- `setCharts(charts: GrafanaChart[])` - Set charts list
- `setSelectedChart(id: string)` - Set selected chart
- `reset()` - Reset to initial state

### React Query Hooks

#### Cluster & Nodes

**`useClusterStats()`**
```typescript
const { data, isLoading, error } = useClusterStats();
// Returns: ClusterStats | undefined
```

**`useSummary(params)`**
```typescript
const { data } = useSummary({ node: 'node-01' });
// Returns: ProcessingSummary | undefined
```

#### Transactions

**`useTransactions(params)`**
```typescript
const { data } = useTransactions({
  page: 1,
  pageSize: 20,
  status: 'COMPLETED'
});
// Returns: PaginatedResponse<Transaction> | undefined
```

**`useTransaction(id)`**
```typescript
const { data } = useTransaction('tx-123');
// Returns: Transaction | undefined
```

**`useTransactionMembers(id, params)`**
```typescript
const { data } = useTransactionMembers('tx-123', { page: 1, pageSize: 10 });
// Returns: PaginatedResponse<TransactionMember> | undefined
```

**`useTransactionEvents(id, params)`**
```typescript
const { data } = useTransactionEvents('tx-123', { page: 1, pageSize: 10 });
// Returns: PaginatedResponse<TransactionEvent> | undefined
```

#### Entity Management

**`useEntityVersions(params)`**
```typescript
const { data } = useEntityVersions({
  entityType: 'ORDER',
  entityId: 'order-123'
});
// Returns: EntityVersion[] | undefined
```

**`useEntityChanges(params)`**
```typescript
const { data } = useEntityChanges({
  entityType: 'ORDER',
  entityId: 'order-123',
  version: 2
});
// Returns: EntityChange[] | undefined
```

**`useEntityStateMachine(params)`**
```typescript
const { data } = useEntityStateMachine({
  entityType: 'ORDER'
});
// Returns: EntityStateMachine | undefined
```

#### Mutations

**`useManualTransition()`**
```typescript
const mutation = useManualTransition();

mutation.mutate({
  entityId: 'entity-123',
  targetState: 'PROCESSED'
});
```

**`useForceMarkProcessed()`**
```typescript
const mutation = useForceMarkProcessed();

mutation.mutate({
  entityId: 'entity-123'
});
```

See [API Hooks Documentation](./docs/API_HOOKS.md) for complete API reference.

### Components

#### Transaction Components

- **`<TransactionStatistics />`** - Display transaction status, duration, and metadata
- **`<TransactionMembersTable />`** - Table of transaction members with filtering
- **`<TransactionEventsTable />`** - Table of transaction events with search

#### Chart Components

- **`<TimeCpuUsage />`** - CPU usage line chart
- **`<TimeDiskIO />`** - Disk I/O line chart
- **`<BarChartStacked />`** - Stacked bar chart for resources

#### Grafana Components

- **`<GrafanaChart />`** - Embed Grafana dashboard panels
- **`<GrafanaChartResetButton />`** - Reset Grafana chart time range

#### Layout Components

- **`<Layout />`** - Main application layout with sidebar and header
- **`<Header />`** - Top navigation header
- **`<Sidebar />`** - Navigation sidebar
- **`<Footer />`** - Application footer

#### Node Components

- **`<Node />`** - Node card with status and metrics

#### Shards Components

- **`<ShardsDetailTabSummary />`** - Shard summary with Grafana charts
- **`<ShardsDetailTabCassandra />`** - Cassandra monitoring
- **`<ShardsDetailTabPmComponents />`** - PM components monitoring

See [Component Documentation](./docs/COMPONENTS.md) for detailed component API.

## 🏗️ Architecture

### State Management Strategy

The application uses a hybrid state management approach:

1. **Zustand** - Client-side UI state
   - User preferences (sidebar state, selected nodes)
   - Application settings (proxy, base URL)
   - Persisted to localStorage for session continuity

2. **React Query** - Server state
   - API data fetching and caching
   - Automatic background refetching
   - Optimistic updates for mutations
   - Request deduplication

3. **React Router** - Navigation state
   - URL-based routing
   - Route parameters for dynamic pages
   - Lazy loading for code splitting

### Data Flow

```
User Action → Component → React Query Hook → API Call
                ↓                              ↓
           Zustand Store ← Cache Update ← Response
                ↓
           UI Update
```

### Routing Structure

Routes are configured in `src/routes/index.tsx`:

| Route | Component | Description |
|-------|-----------|-------------|
| `/processing-ui` | Home | Landing page |
| `/processing-ui/nodes` | Nodes | Nodes list |
| `/processing-ui/nodes/:name` | NodesDetail | Node detail |
| `/processing-ui/nodes/:name/transaction/:transactionId` | TransactionDetail | Transaction detail |
| `/processing-ui/nodes/:name/versions` | TransitionVersions | Entity versions |
| `/processing-ui/nodes/:name/changes` | TransitionChanges | Entity changes |
| `/processing-ui/nodes/:name/state-machine` | TransitionEntityStateMachine | State machine |
| `/processing-ui/nodes/:name/events` | EventView | Processing events |

### Project Structure

```
react-project/packages/processing-manager-react/
├── src/
│   ├── components/              # React components
│   │   ├── charts/             # Chart components (Chart.js)
│   │   ├── common/             # Common/utility components
│   │   ├── grafana/            # Grafana integration
│   │   ├── layout/             # Layout components
│   │   ├── node/               # Node components
│   │   ├── shards/             # Shards detail components
│   │   ├── __tests__/          # Component tests
│   │   ├── TransactionStatistics.tsx
│   │   ├── TransactionMembersTable.tsx
│   │   ├── TransactionEventsTable.tsx
│   │   └── index.ts
│   ├── hooks/                   # React Query hooks
│   │   ├── __tests__/          # Hook tests
│   │   ├── useProcessing.ts    # Main API hooks
│   │   └── index.ts
│   ├── pages/                   # Page components
│   │   ├── Home.tsx
│   │   ├── Nodes.tsx
│   │   ├── NodesDetail.tsx
│   │   ├── TransactionDetail.tsx
│   │   ├── TransitionVersions.tsx
│   │   ├── TransitionChanges.tsx
│   │   ├── TransitionEntityStateMachine.tsx
│   │   ├── EventView.tsx
│   │   └── Page404.tsx
│   ├── routes/                  # Route configuration
│   │   └── index.tsx
│   ├── stores/                  # Zustand stores
│   │   ├── __tests__/          # Store tests
│   │   ├── appStore.ts
│   │   ├── processingStore.ts
│   │   ├── sshStore.ts
│   │   ├── grafanaStore.ts
│   │   └── index.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts            # 300+ lines of type definitions
│   ├── utils/                   # Utility functions
│   │   ├── HelperUrl.ts        # URL helpers with proxy support
│   │   ├── chartConfig.ts      # Chart.js configuration
│   │   └── index.ts
│   ├── test/                    # Test utilities
│   │   ├── setup.ts            # Vitest setup
│   │   └── test-utils.tsx      # Testing library utilities
│   ├── App.tsx                  # Main app component
│   ├── App.scss                 # Global styles
│   ├── main.tsx                 # Entry point
│   ├── index.scss               # Base styles
│   └── index.ts                 # Package exports
├── public/
│   └── config.json              # Runtime configuration
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── vitest.config.ts             # Vitest config
└── README.md                    # This file
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/stores/__tests__/appStore.test.ts
```

### Test Coverage

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| Stores | 4 | 62 | ~95% |
| Hooks | 1 | 18 | ~90% |
| Components | 14 | 140 | ~85% |
| **Total** | **19** | **220** | **~90%** |

### Testing Stack

- **Vitest 3.2.4** - Fast unit test framework
- **React Testing Library 16.3.0** - Component testing utilities
- **@testing-library/user-event 14.6.1** - User interaction simulation
- **@testing-library/jest-dom 6.9.1** - Custom DOM matchers

### Writing Tests

Example component test:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

See `docs/API_HOOKS.md` and `docs/COMPONENTS.md` for additional documentation.

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.7.3 | Type safety |
| **React Router** | 7.1.1 | Client-side routing |
| **Zustand** | 5.0.2 | Client state management |
| **React Query** | 5.62.11 | Server state management |
| **Ant Design** | 5.22.6 | UI component library |
| **Chart.js** | 4.4.7 | Data visualization |
| **Axios** | 1.7.9 | HTTP client |
| **Vite** | 6.0.11 | Build tool & dev server |
| **Vitest** | 3.2.4 | Unit testing framework |
| **SCSS** | - | Styling |

## 📖 Additional Documentation

- [API Hooks Documentation](./docs/API_HOOKS.md) - API reference
- [Component Documentation](./docs/COMPONENTS.md) - Component API reference

## 🤝 Contributing

This package is part of the Cyoda UI React migration project.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Run tests: `npm test`
5. Run type checking: `npm run type-check`
6. Build: `npm run build`
7. Submit pull request

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Write tests for all new features
- Document public APIs with JSDoc
- Use Prettier for formatting
- Follow Ant Design patterns

## 📄 License

**PRIVATE** - Cyoda

This is proprietary software. Unauthorized copying, distribution, or use is strictly prohibited.

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0
**Status**: Production Ready (95% Complete)

