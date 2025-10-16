# @cyoda/cobi-react

COBI - Data Mapping and Configuration Application (React)

## Overview

The COBI package is the main data mapping and configuration application for the Cyoda platform. It provides comprehensive data integration capabilities including:

- **Data Mapper** - Visual entity mapping tool for creating data transformations
- **Data Source Configuration** - Configure CSV, XML, JDBC, and HTTP data sources
- **Data Chaining** - Chain multiple data operations together
- **Data Management Dashboard** - Monitor and manage data imports
- **Tools** - Utility tools including Blockly editor

## Installation

```bash
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check
```

## Features

### 1. Data Mapper

Visual entity mapping tool for creating data transformations:

- Upload sample data files (CSV, XML, JSON)
- Configure CSV parsing settings
- Select target entity classes
- Visual data mapping interface with drag-and-drop
- Column mapping with transformers
- Functional mappings
- Auto-save functionality
- Export/Import configurations

### 2. Data Source Configuration

Configure external data sources:

- **HTTP Connections**: REST API endpoints with authentication
- **SQL Connections**: JDBC database connections
- **Workflow Connections**: State machine integrations
- File upload with FilePond
- Sample data preview
- Connection testing
- Run configurations

### 3. Data Chaining

Chain multiple data operations together:

- Select source data source
- Define next operation in the chain
- Map parameters between operations
- Configure relative paths for data extraction
- Export/Import configurations

### 4. Data Management Dashboard

Monitor and manage data imports:

- Import statistics (success/failure rates)
- Execution history tracking
- Diagram visualization of data flows
- Real-time monitoring of ongoing imports

### 5. Tools

Utility tools:

- **Blockly Editor**: Visual programming for data transformations
- **JSON Converter**: Convert between different data formats
- **Data Validator**: Validate data against schemas

## Routes

- `/` - Redirects to Data Mapper
- `/data-mapper` - Data Mapper index page
- `/data-mapper/configuration` - Data Mapper edit page
- `/data-mapper/data-source-config-creation` - Data Source Config index
- `/data-mapper/data-source-config-creation/configuration` - Data Source Config edit
- `/data-chaining` - Data Chaining index page
- `/data-chaining/configuration` - Data Chaining edit page
- `/data-management-dashboard` - Data Management Dashboard
- `/tools` - Tools page
- `/404` - 404 page

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI components
- **React Router** - Routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Vite** - Build tool
- **Vitest** - Testing framework

### Special Libraries

- **Blockly** - Visual programming blocks
- **Cytoscape** - Graph visualization
- **FilePond** - File uploads
- **CSV Parse/Stringify** - CSV processing
- **Fast XML Parser** - XML parsing
- **Crypto-js** - Encryption
- **File Saver** - File downloads
- **JSZip** - ZIP file handling
- **JSONPath Plus** - JSON path queries
- **Lodash** - Utilities
- **Moment** - Date handling
- **Prism** - Code highlighting

## Project Structure

```
src/
├── components/       # React components
├── pages/           # Page components
│   ├── DataMapper/
│   ├── DataSourceConfig/
│   ├── DataChaining/
│   ├── DataManagementDashboard/
│   └── Tools/
├── stores/          # Zustand stores
├── hooks/           # React Query hooks
├── types/           # TypeScript types
├── utils/           # Utility functions
├── routes/          # Route configuration
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.ts         # Package exports
```

## Type Definitions

The package includes comprehensive TypeScript type definitions:

### Data Mapping Types

- `MappingConfigDto` - Main mapping configuration
- `EntityMappingConfigDto` - Entity mapping details
- `ColumnMappingConfigDto` - Column mappings
- `FunctionalMappingConfigDto` - Functional mappings
- And 20+ related types

### Data Source Configuration Types

- `DataSourceConfigDto` - Data source configuration
- `HttpConnectionDetailsDto` - HTTP connections
- `SqlConnectionDetailsDto` - SQL connections
- `HttpEndpointDto`, `SqlEndpointDto` - Endpoints
- And 15+ related types

### Data Chaining Types

- `ChainingConfigDto` - Chaining configuration
- `ChainingParameterDto` - Chaining parameters

## Development Status

**Status**: 🟡 In Progress (30% Complete)

**Completed**:
- ✅ Package structure and configuration
- ✅ Type definitions (300 lines)
- ✅ Dependencies installed
- ✅ Main entry point and App component
- ✅ Route configuration
- ✅ Placeholder pages (8 pages)
- ✅ Build configuration
- ✅ Successfully builds

**In Progress**:
- ⏳ Zustand stores (6 stores)
- ⏳ React Query hooks
- ⏳ Data Mapper components
- ⏳ Data Source Configuration components
- ⏳ Data Chaining components
- ⏳ Dashboard components
- ⏳ Tools components
- ⏳ Testing

## Migration Notes

This package is being migrated from Vue 3 to React 18. The migration follows a phased approach:

1. **Phase 1**: Setup & Foundation ✅ (Complete)
2. **Phase 2**: Type Definitions & Stores (In Progress)
3. **Phase 3**: Core Pages - Data Mapper
4. **Phase 4**: Data Source Configuration
5. **Phase 5**: Data Chaining
6. **Phase 6**: Dashboard & Tools
7. **Phase 7**: Testing
8. **Phase 8**: Polish & Documentation

See [COBI_MIGRATION_PLAN.md](../../../COBI_MIGRATION_PLAN.md) for detailed migration plan.

## License

Proprietary - Cyoda

