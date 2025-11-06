# @cyoda/cyoda-sass-react

A React-based SaaS application for managing Trino SQL schemas with a modern, intuitive interface.

## 📋 Overview

This package provides a comprehensive solution for creating, editing, and managing Trino SQL schemas. It includes features for:

- **Schema Management**: Create, edit, and delete SQL schemas
- **Table Editor**: Visual table editor with drag-and-drop field reordering
- **Field Management**: Add, edit, hide, and reorder fields within tables
- **Entity Model Import**: Import entity models from the backend system
- **Nested Fields**: Support for complex nested array structures
- **Validation**: Real-time field name and schema validation
- **State Persistence**: Automatic state saving to localStorage

## 🚀 Features

### Core Functionality

- ✅ **Schema CRUD Operations**: Full create, read, update, delete operations for SQL schemas
- ✅ **Visual Table Editor**: Drag-and-drop interface for managing table fields
- ✅ **Field Validation**: Real-time validation with regex patterns
- ✅ **Hidden Fields/Tables**: Soft delete functionality for fields and tables
- ✅ **Nested Array Fields**: Recursive field structure for complex data types
- ✅ **Entity Model Import**: Import pre-defined entity models
- ✅ **Responsive Design**: Mobile-friendly interface using Ant Design
- ✅ **Type Safety**: Full TypeScript support with strict mode

### Technical Features

- ✅ **React 18.3.1**: Modern React with hooks and concurrent features
- ✅ **TypeScript**: Strict type checking for reliability
- ✅ **Ant Design 5.21.2**: Professional UI components
- ✅ **React Query**: Efficient server state management
- ✅ **Zustand**: Lightweight client state management
- ✅ **React Router**: Client-side routing
- ✅ **@dnd-kit**: Accessible drag-and-drop functionality
- ✅ **Vite**: Fast build tooling and HMR

## 📦 Installation

```bash
npm install @cyoda/cyoda-sass-react
```

### Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "antd": "^5.21.2",
  "@tanstack/react-query": "^5.59.16"
}
```

## 🏗️ Project Structure

```
src/
├── api/                    # API client and endpoints
│   └── sqlSchemaApi.ts    # SQL schema API methods
├── components/            # Reusable components
│   ├── dialogs/          # Dialog components
│   │   ├── HiddenFieldsPopUp.tsx
│   │   ├── HiddenTablesPopUp.tsx
│   │   └── ModelsPopUp.tsx
│   └── TrinoEditTable/   # Table editor component
│       ├── TrinoEditTable.tsx
│       └── TrinoEditTable.css
├── hooks/                # Custom React hooks
│   └── useSqlSchema.ts   # SQL schema hooks
├── pages/                # Page components
│   ├── LoginView.tsx     # Login page
│   └── Trino/           # Trino schema pages
│       ├── TrinoIndex.tsx
│       └── TrinoEdit.tsx
├── router/               # Routing configuration
│   └── index.tsx
├── stores/               # State management
│   └── appStore.ts       # App-wide state
├── types/                # TypeScript types
│   └── index.ts
├── utils/                # Utility functions
│   ├── helpers.ts        # Helper functions
│   └── validation.ts     # Validation functions
└── App.tsx               # Root component
```

## 🎯 Usage

### Basic Setup

```tsx
import { App } from '@cyoda/cyoda-sass-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
```

### Using Hooks

```tsx
import { useSchemas, useSaveSchema } from '@cyoda/cyoda-sass-react/hooks/useSqlSchema';

function MyComponent() {
  // Fetch all schemas
  const { data: schemas, isLoading } = useSchemas();
  
  // Save schema mutation
  const { mutateAsync: saveSchema } = useSaveSchema();
  
  const handleSave = async (schema: SqlSchema) => {
    await saveSchema(schema);
  };
  
  return (
    <div>
      {isLoading ? 'Loading...' : schemas?.map(schema => (
        <div key={schema.id}>{schema.schemaName}</div>
      ))}
    </div>
  );
}
```

### Using Components

```tsx
import { TrinoEditTable } from '@cyoda/cyoda-sass-react/components/TrinoEditTable';

function TableEditor() {
  const [table, setTable] = useState<SqlTable>({
    metadataClassId: '1',
    tableName: 'my_table',
    uniformedPath: 'path',
    fields: [],
  });
  
  const handleFieldsChange = (newFields: SqlField[]) => {
    setTable({ ...table, fields: newFields });
  };
  
  return (
    <TrinoEditTable 
      table={table} 
      onFieldsChange={handleFieldsChange}
    />
  );
}
```

## 🧪 Testing

The package includes comprehensive test coverage:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **80 tests total**
- **60 tests passing (75%)**
- **100% coverage** for utilities and stores
- Component tests for all major features

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest

## 📝 API Reference

### Hooks

#### `useSchemas()`
Fetch all SQL schemas.

**Returns**: `UseQueryResult<SqlSchema[]>`

#### `useSchema(id: string, enabled?: boolean)`
Fetch a single schema by ID.

**Parameters**:
- `id` - Schema UUID
- `enabled` - Whether to run the query (default: true)

**Returns**: `UseQueryResult<SqlSchema>`

#### `useSaveSchema()`
Create or update a schema.

**Returns**: `UseMutationResult<SqlSchema, Error, SqlSchema>`

#### `useDeleteSchema()`
Delete a schema.

**Returns**: `UseMutationResult<void, Error, string>`

#### `useEntityModels()`
Fetch all entity models.

**Returns**: `UseQueryResult<EntityModel[]>`

#### `useGenTables(id: string, enabled?: boolean)`
Generate tables from an entity model.

**Parameters**:
- `id` - Entity model ID
- `enabled` - Whether to run the query (default: false)

**Returns**: `UseQueryResult<SqlTable>`

### Types

#### `SqlSchema`
```typescript
interface SqlSchema {
  id?: string;
  schemaName: string;
  tables: SqlTable[];
  timestamp?: number;
}
```

#### `SqlTable`
```typescript
interface SqlTable {
  metadataClassId: string;
  tableName: string;
  uniformedPath: string;
  fields: SqlField[];
  hidden?: boolean;
}
```

#### `SqlField`
```typescript
interface SqlField {
  fieldName: string;
  fieldType: string;
  fieldCategory: 'DATA' | 'METADATA';
  hidden?: boolean;
  flatten?: boolean;
  arrayFields?: SqlField[];
}
```

## 🎨 Styling

The package uses Ant Design for UI components and includes custom CSS for specific components. You can customize the theme by providing an Ant Design ConfigProvider:

```tsx
import { ConfigProvider } from 'antd';

<ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
  <App />
</ConfigProvider>
```

## 🤝 Contributing

This package is part of the CYODA monorepo. Please follow the contribution guidelines in the root repository.

## 📄 License

Proprietary - CYODA

## 🔗 Related Packages

- `@cyoda/ui-lib-react` - Shared UI components
- `@cyoda/api-client` - API client library

## 📞 Support

For issues and questions, please contact the CYODA development team.

---

**Built with ❤️ by the CYODA Team**

