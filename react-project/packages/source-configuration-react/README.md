# @cyoda/source-configuration-react

Source configuration management for CSV, XML, and JDBC data sources.

## Features

- **CSV Configuration**: Configure CSV file ingestion with column mapping
- **XML Configuration**: Configure XML file ingestion with XPath-based column mapping
- **JDBC Configuration**: Configure database connections and SQL queries for data ingestion
- **File Upload**: Upload and ingest source files
- **Mapper Configuration**: Configure data mappers and transformations
- **Alias Management**: Map source columns to catalog aliases

## Installation

```bash
npm install @cyoda/source-configuration-react
```

## Usage

### As a Standalone App

```tsx
import { App } from '@cyoda/source-configuration-react';
import '@cyoda/source-configuration-react/styles';

function MyApp() {
  return <App />;
}
```

### Using Individual Components

```tsx
import { ConfigurationsList } from '@cyoda/source-configuration-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function MyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigurationsList />
    </QueryClientProvider>
  );
}
```

### Using Hooks

```tsx
import {
  useAllConfigs,
  useSaveConfig,
  useUploadFile,
} from '@cyoda/source-configuration-react';

function MyComponent() {
  const { data: configs, isLoading } = useAllConfigs();
  const { mutate: saveConfig } = useSaveConfig();
  const { mutate: uploadFile } = useUploadFile();

  const handleSave = (config) => {
    saveConfig(config);
  };

  const handleUpload = (configId, file) => {
    uploadFile({ configId, file });
  };

  // ... rest of component
}
```

### Using the Store

```tsx
import { useSourceConfigStore } from '@cyoda/source-configuration-react';

function MyComponent() {
  const filterText = useSourceConfigStore((state) => state.filterText);
  const setFilterText = useSourceConfigStore((state) => state.setFilterText);
  const editingConfig = useSourceConfigStore((state) => state.editingConfig);

  // ... rest of component
}
```

## API Hooks

### Encompass (CSV/XML) Hooks

- `useEncompassConfigs()` - Get all CSV/XML configurations
- `useConfigNames()` - Get list of configuration names
- `useMappersList()` - Get available mappers
- `useAliases()` - Get catalog aliases
- `useSaveConfig()` - Save configuration (create/update)
- `useUploadSample()` - Upload sample file for preview
- `useUploadFile()` - Upload file for ingestion

### JDBC (Wolters Kluwer) Hooks

- `useJdbcConfigs()` - Get all JDBC configurations
- `useJdbcMappersList()` - Get JDBC mappers
- `useTestJdbcConnection()` - Test database connection
- `useSaveJdbcConfig()` - Save JDBC configuration
- `useRunJdbcConfig()` - Run JDBC ingestion

### Combined Hooks

- `useAllConfigs()` - Get all configurations (CSV + XML + JDBC)

## Types

All TypeScript types are exported from the package:

```tsx
import type {
  UploadConfig,
  CsvUploadConfig,
  XmlUploadConfig,
  JdbcSourceConfig,
  ColumnMapping,
  MapperInfo,
  CatalogItem,
} from '@cyoda/source-configuration-react';
```

## Components

### ConfigurationsList

Main component displaying all source configurations with filtering, editing, and actions.

**Props**: None (uses React Query and Zustand for state management)

## Store

The package uses Zustand for client-side state management with localStorage persistence.

**State**:
- `editingConfig` - Currently editing configuration
- `uploadProgress` - File upload progress tracking
- `isCreateDialogOpen` - Create dialog visibility
- `isUploadDialogOpen` - Upload dialog visibility
- `filterText` - Filter text for configurations list

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build package
npm run build

# Run tests
npm test

# Type check
npm run type-check
```

## Dependencies

- React 18+
- React Router DOM
- React Query (TanStack Query)
- Ant Design
- Zustand
- Axios
- FilePond (for file uploads)
- @cyoda/http-api-react
- @cyoda/ui-lib-react

## License

Proprietary - CYODA

