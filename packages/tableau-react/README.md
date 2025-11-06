# @cyoda/tableau-react

Cyoda Tableau Integration - React Version

## Overview

This package provides Tableau Web Data Connector integration for displaying Cyoda reports in Tableau dashboards. It allows users to browse report history, select reports, and send data to Tableau for visualization.

## Features

- 📊 **Tableau Web Data Connector** - Seamless integration with Tableau Desktop/Server
- 📜 **Report History** - Browse and filter historical reports
- 🔍 **Advanced Filtering** - Filter by config, type, user, status, and date range
- 📈 **Data Transformation** - Automatic data formatting for Tableau
- 🔐 **Authentication** - Integrated with Cyoda authentication system
- 🎨 **Modern UI** - Built with Ant Design components
- ⚡ **Real-time Updates** - React Query for efficient data fetching
- 💾 **State Management** - Zustand for client-side state

## Installation

```bash
npm install @cyoda/tableau-react
```

## Dependencies

This package depends on:
- `@cyoda/ui-lib-react` - Shared UI components
- `@cyoda/http-api-react` - HTTP API layer
- `react` - React library
- `react-dom` - React DOM library
- `antd` - Ant Design UI components
- `@tanstack/react-query` - Data fetching and caching
- `zustand` - State management
- `axios` - HTTP client
- `moment` - Date/time manipulation
- `prismjs` - Syntax highlighting

## Usage

### Basic Setup

```tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '@cyoda/tableau-react';

const queryClient = new QueryClient();

function MyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Using Components

#### HistoryTable Component

```tsx
import { HistoryTable } from '@cyoda/tableau-react';

function MyReports() {
  const [filter, setFilter] = useState({
    config: '',
    type: '',
    user: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [settings, setSettings] = useState({
    lazyLoading: false,
    displayGroupType: 'out',
  });

  const handleChange = ({ reportDefinition, configDefinition }) => {
    console.log('Selected report:', reportDefinition);
    console.log('Config:', configDefinition);
  };

  return (
    <HistoryTable
      filter={filter}
      settings={settings}
      onChange={handleChange}
    />
  );
}
```

#### ReportTableRows Component

```tsx
import { ReportTableRows } from '@cyoda/tableau-react';

function MyTableauConnector() {
  return (
    <ReportTableRows
      tableLinkRows="/platform-api/reporting/report/123/rows"
      lazyLoading={false}
      configDefinition={{
        id: 'config-1',
        description: 'My Report',
        columns: [
          { name: 'column1' },
          { name: 'column2' },
        ],
      }}
    />
  );
}
```

### Using Stores

#### Charts Data Store

```tsx
import { useChartsDataStore } from '@cyoda/tableau-react';

function MyComponent() {
  const { addChartRows, clearChartRows, getChartRows } = useChartsDataStore();

  const handleAddData = () => {
    addChartRows([
      { id: '1', name: 'Row 1', value: 100 },
      { id: '2', name: 'Row 2', value: 200 },
    ]);
  };

  const handleClearData = () => {
    clearChartRows();
  };

  const rows = getChartRows();

  return (
    <div>
      <button onClick={handleAddData}>Add Data</button>
      <button onClick={handleClearData}>Clear Data</button>
      <div>Total Rows: {rows.length}</div>
    </div>
  );
}
```

## API Reference

### Types

#### ReportHistoryData
```typescript
interface ReportHistoryData {
  id: string;
  configName: string;
  createTime: string;
  finishTime: string;
  type: string;
  user: { username: string };
  status: string;
  totalRowsCount: number;
  groupingColumns: string[];
  groupingVersion: string;
  hierarhyEnable: boolean;
  regroupingPossible: boolean;
}
```

#### HistoryFilter
```typescript
interface HistoryFilter {
  config: string;
  type: string;
  user: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}
```

#### HistorySettings
```typescript
interface HistorySettings {
  lazyLoading: boolean;
  displayGroupType: 'in' | 'out';
}
```

#### ConfigDefinition
```typescript
interface ConfigDefinition {
  id?: string;
  description?: string;
  groupingVersion?: string;
  columns?: Array<{
    name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}
```

### Components

#### HistoryTable

Props:
- `filter: HistoryFilter` - Filter criteria for reports
- `settings: HistorySettings` - Display settings
- `onChange: (data) => void` - Callback when report is selected

#### ReportTableRows

Props:
- `tableLinkRows: string` - API endpoint for report rows
- `lazyLoading: boolean` - Enable lazy loading
- `configDefinition: ConfigDefinition` - Report configuration

### Stores

#### useChartsDataStore

Methods:
- `addChartRows(rows: ChartRow[])` - Add or update chart rows
- `clearChartRows()` - Clear all chart rows
- `getChartRows()` - Get current chart rows

State:
- `rowsMap: Map<string, ChartRow>` - Map of rows by ID
- `rowsArr: ChartRow[]` - Array of rows

## Tableau Web Data Connector

This package includes a Tableau Web Data Connector (WDC) that allows Tableau to connect to Cyoda reports.

### Setup

1. Include the `tableau.js` script in your HTML:
```html
<script src="/tableau.js"></script>
```

2. The connector will automatically:
   - Define the schema based on report columns
   - Load data from the report
   - Submit data to Tableau

### How It Works

1. User selects a report from the history table
2. Report data is loaded and transformed
3. Data is sent to Tableau via the WDC
4. Tableau creates a data source from the report

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
src/
├── components/          # React components
│   ├── HistoryTable.tsx
│   ├── HistoryTable.scss
│   ├── ReportTableRows.tsx
│   └── ReportTableRows.scss
├── pages/              # Page components
│   ├── Reports.tsx
│   └── Reports.scss
├── stores/             # Zustand stores
│   ├── chartsDataStore.ts
│   └── index.ts
├── types/              # TypeScript types
│   └── index.ts
├── routes/             # Route configuration
│   └── index.tsx
├── App.tsx             # Main app component
├── App.scss            # App styles
├── main.tsx            # Entry point
└── index.scss          # Global styles
```

## Testing

The package includes comprehensive tests for:
- Components (HistoryTable, ReportTableRows)
- Stores (chartsDataStore)
- Integration scenarios
- Edge cases

Run tests with:
```bash
npm test
```

## Migration from Vue

This package was migrated from the Vue 3 version. Key changes:

- **Vuex → Zustand** - State management
- **Vue Router → React Router** - Routing
- **Element Plus → Ant Design** - UI components
- **Pinia → Zustand** - Store management
- **Vue Composables → React Hooks** - Reusable logic

## Contributing

Please read the main project's CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-16  
**Status**: In Development

