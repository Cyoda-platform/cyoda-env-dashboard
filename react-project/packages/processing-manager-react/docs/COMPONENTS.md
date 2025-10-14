# Components Documentation

Complete reference for all React components in the Processing Manager package.

## Table of Contents

- [Overview](#overview)
- [Transaction Components](#transaction-components)
- [Chart Components](#chart-components)
- [Grafana Components](#grafana-components)
- [Layout Components](#layout-components)
- [Node Components](#node-components)
- [Shards Components](#shards-components)
- [Common Components](#common-components)

## Overview

All components are built with:
- **React 18.3.1** - Functional components with hooks
- **TypeScript** - Full type safety
- **Ant Design 5.22.6** - UI components
- **SCSS** - Styling

### Import Pattern

```typescript
import { 
  TransactionStatistics,
  TransactionMembersTable,
  GrafanaChart,
  Layout,
  Node
} from '@cyoda/processing-manager-react';
```

## Transaction Components

### `TransactionStatistics`

Displays statistical overview of a transaction including member counts, status distribution, and timing information.

**Props:**
```typescript
interface TransactionStatisticsProps {
  /** Transaction ID */
  transactionId: string;
  
  /** Optional CSS class name */
  className?: string;
}
```

**Example:**
```typescript
import { TransactionStatistics } from '@cyoda/processing-manager-react';

function TransactionPage({ id }: { id: string }) {
  return (
    <div>
      <h1>Transaction Details</h1>
      <TransactionStatistics transactionId={id} />
    </div>
  );
}
```

**Features:**
- Real-time statistics using React Query
- Status breakdown with color coding
- Processing time metrics
- Member count by entity type
- Automatic refresh on data changes

---

### `TransactionMembersTable`

Displays paginated table of transaction members with filtering and sorting.

**Props:**
```typescript
interface TransactionMembersTableProps {
  /** Transaction ID */
  transactionId: string;
  
  /** Initial page size (default: 20) */
  pageSize?: number;
  
  /** Show entity type filter (default: true) */
  showFilters?: boolean;
  
  /** Custom row click handler */
  onRowClick?: (member: TransactionMember) => void;
}
```

**Example:**
```typescript
import { TransactionMembersTable } from '@cyoda/processing-manager-react';

function MembersView({ transactionId }: { transactionId: string }) {
  const handleRowClick = (member) => {
    console.log('Selected member:', member);
  };
  
  return (
    <TransactionMembersTable
      transactionId={transactionId}
      pageSize={50}
      showFilters={true}
      onRowClick={handleRowClick}
    />
  );
}
```

**Features:**
- Server-side pagination
- Entity type filtering
- Operation type filtering
- Status filtering
- Sortable columns
- Row selection
- Export to CSV

---

### `TransactionEventsTable`

Displays paginated table of transaction events with timeline view.

**Props:**
```typescript
interface TransactionEventsTableProps {
  /** Transaction ID */
  transactionId: string;
  
  /** Initial page size (default: 20) */
  pageSize?: number;
  
  /** Show event type filter (default: true) */
  showFilters?: boolean;
  
  /** Show timeline view (default: false) */
  showTimeline?: boolean;
}
```

**Example:**
```typescript
import { TransactionEventsTable } from '@cyoda/processing-manager-react';

function EventsView({ transactionId }: { transactionId: string }) {
  return (
    <TransactionEventsTable
      transactionId={transactionId}
      pageSize={30}
      showTimeline={true}
    />
  );
}
```

**Features:**
- Server-side pagination
- Event type filtering
- Timeline visualization
- Timestamp formatting
- Event details expansion
- Search functionality

## Chart Components

### `TimeCpuUsage`

Displays CPU usage over time using Chart.js line chart.

**Props:**
```typescript
interface TimeCpuUsageProps {
  /** Node hostname */
  node: string;
  
  /** Time range in hours (default: 24) */
  timeRange?: number;
  
  /** Refresh interval in seconds (default: 30) */
  refreshInterval?: number;
  
  /** Chart height in pixels (default: 300) */
  height?: number;
}
```

**Example:**
```typescript
import { TimeCpuUsage } from '@cyoda/processing-manager-react';

function NodeMetrics({ nodeName }: { nodeName: string }) {
  return (
    <div>
      <h3>CPU Usage</h3>
      <TimeCpuUsage 
        node={nodeName}
        timeRange={48}
        refreshInterval={60}
        height={400}
      />
    </div>
  );
}
```

**Features:**
- Real-time data updates
- Configurable time range
- Auto-refresh
- Responsive design
- Zoom and pan controls
- Tooltip with detailed info

---

### `TimeDiskIO`

Displays disk I/O metrics over time.

**Props:**
```typescript
interface TimeDiskIOProps {
  /** Node hostname */
  node: string;
  
  /** Time range in hours (default: 24) */
  timeRange?: number;
  
  /** Chart height in pixels (default: 300) */
  height?: number;
}
```

**Features:**
- Read/write metrics
- Real-time updates
- Color-coded lines
- Interactive legend

---

### `BarChartStacked`

Generic stacked bar chart component for various metrics.

**Props:**
```typescript
interface BarChartStackedProps {
  /** Chart data */
  data: ChartData;
  
  /** Chart options */
  options?: ChartOptions;
  
  /** Chart height in pixels (default: 300) */
  height?: number;
}
```

## Grafana Components

### `GrafanaChart`

Embeds Grafana dashboard panels with interactive controls.

**Props:**
```typescript
interface GrafanaChartProps {
  /** Grafana dashboard UID */
  dashboardUid: string;
  
  /** Panel ID */
  panelId: number;
  
  /** Time range (default: 'now-6h') */
  from?: string;
  
  /** Time range end (default: 'now') */
  to?: string;
  
  /** Refresh interval (default: '30s') */
  refresh?: string;
  
  /** Chart height in pixels (default: 400) */
  height?: number;
  
  /** Theme ('light' | 'dark', default: 'light') */
  theme?: 'light' | 'dark';
}
```

**Example:**
```typescript
import { GrafanaChart } from '@cyoda/processing-manager-react';

function MetricsDashboard() {
  return (
    <div>
      <GrafanaChart
        dashboardUid="processing-metrics"
        panelId={1}
        from="now-24h"
        to="now"
        refresh="1m"
        height={500}
        theme="dark"
      />
    </div>
  );
}
```

**Features:**
- Embedded Grafana panels
- Time range controls
- Auto-refresh
- Theme support
- Full-screen mode
- Export options

---

### `GrafanaChartResetButton`

Reset button for Grafana chart time ranges.

**Props:**
```typescript
interface GrafanaChartResetButtonProps {
  /** Chart ID to reset */
  chartId: string;
  
  /** Button size (default: 'middle') */
  size?: 'small' | 'middle' | 'large';
}
```

## Layout Components

### `Layout`

Main application layout with header, sidebar, and content area.

**Props:**
```typescript
interface LayoutProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Show sidebar (default: true) */
  showSidebar?: boolean;
  
  /** Show header (default: true) */
  showHeader?: boolean;
  
  /** Show footer (default: true) */
  showFooter?: boolean;
}
```

**Example:**
```typescript
import { Layout } from '@cyoda/processing-manager-react';

function App() {
  return (
    <Layout showSidebar={true} showHeader={true}>
      <YourPageContent />
    </Layout>
  );
}
```

**Features:**
- Responsive layout
- Collapsible sidebar
- Sticky header
- Breadcrumb navigation
- Theme switching

---

### `Header`

Application header with navigation and user controls.

**Props:**
```typescript
interface HeaderProps {
  /** Show user menu (default: true) */
  showUserMenu?: boolean;
  
  /** Show notifications (default: true) */
  showNotifications?: boolean;
  
  /** Custom logo component */
  logo?: React.ReactNode;
}
```

---

### `Sidebar`

Navigation sidebar with menu items.

**Props:**
```typescript
interface SidebarProps {
  /** Collapsed state (default: false) */
  collapsed?: boolean;
  
  /** Collapse change handler */
  onCollapse?: (collapsed: boolean) => void;
  
  /** Custom menu items */
  menuItems?: MenuItem[];
}
```

---

### `Footer`

Application footer with links and copyright.

**Props:**
```typescript
interface FooterProps {
  /** Show version info (default: true) */
  showVersion?: boolean;
  
  /** Custom links */
  links?: FooterLink[];
}
```

## Node Components

### `Node`

Displays node information card with status and metrics.

**Props:**
```typescript
interface NodeProps {
  /** Node data */
  node: PmNode;
  
  /** Show metrics (default: true) */
  showMetrics?: boolean;
  
  /** Click handler */
  onClick?: (node: PmNode) => void;
  
  /** Selected state (default: false) */
  selected?: boolean;
}
```

**Example:**
```typescript
import { Node } from '@cyoda/processing-manager-react';

function NodesList({ nodes }: { nodes: PmNode[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  return (
    <div className="nodes-grid">
      {nodes.map((node) => (
        <Node
          key={node.hostname}
          node={node}
          selected={selected === node.hostname}
          onClick={(n) => setSelected(n.hostname)}
        />
      ))}
    </div>
  );
}
```

**Features:**
- Status indicator
- CPU/Memory metrics
- Health check status
- Click to select
- Hover effects

## Shards Components

### `ShardsDetailTabSummary`

Summary tab for shards detail view.

**Props:**
```typescript
interface ShardsDetailTabSummaryProps {
  /** Node hostname */
  node: string;
}
```

---

### `ShardsDetailTabCassandra`

Cassandra-specific shards information.

**Props:**
```typescript
interface ShardsDetailTabCassandraProps {
  /** Node hostname */
  node: string;
  
  /** Show replication info (default: true) */
  showReplication?: boolean;
}
```

---

### `ShardsDetailTabPmComponents`

Processing Manager components tab.

**Props:**
```typescript
interface ShardsDetailTabPmComponentsProps {
  /** Node hostname */
  node: string;
}
```

## Common Components

### `ViewWrapper`

Wrapper component for consistent page layout.

**Props:**
```typescript
interface ViewWrapperProps {
  /** Page title */
  title?: string;
  
  /** Child components */
  children: React.ReactNode;
  
  /** Show back button (default: false) */
  showBack?: boolean;
  
  /** Extra actions */
  extra?: React.ReactNode;
}
```

**Example:**
```typescript
import { ViewWrapper } from '@cyoda/processing-manager-react';

function MyPage() {
  return (
    <ViewWrapper 
      title="My Page" 
      showBack={true}
      extra={<Button>Action</Button>}
    >
      <YourContent />
    </ViewWrapper>
  );
}
```

---

**Last Updated:** 2025-10-14  
**Version:** 1.0.0

