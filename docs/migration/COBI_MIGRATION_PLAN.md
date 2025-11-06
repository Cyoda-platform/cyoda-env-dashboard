# COBI Package Migration Plan

**Package**: @cyoda/cobi (Vue) → @cyoda/cobi-react (React)  
**Priority**: P1 (High) - Main Application  
**Estimated Time**: 7-10 days  
**Status**: 🟡 In Progress  
**Start Date**: 2025-10-16

---

## Package Overview

The COBI package is the main data mapping and configuration application. It provides:

1. **Data Mapper** - Visual data mapping tool for creating entity mappings
2. **Data Source Configuration** - Configure CSV, XML, and JDBC data sources
3. **Data Chaining** - Chain multiple data operations together
4. **Data Management Dashboard** - Monitor and manage data imports
5. **Tools** - Utility tools (Blockly, etc.)

This is a complex application with:
- Visual data mapping interface
- Blockly integration for visual programming
- AI chatbot integration
- File upload and processing
- Real-time data preview
- Complex state management
- Auto-saving functionality

---

## Current Package Analysis

### Dependencies (from package.json)
- **UI Framework**: Vue 3 + Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Special Libraries**:
  - `blockly` - Visual programming blocks
  - `cytoscape` - Graph visualization
  - `filepond` - File uploads
  - `csv-parse`, `csv-stringify` - CSV processing
  - `fast-xml-parser` - XML parsing
  - `crypto-js` - Encryption
  - `file-saver` - File downloads
  - `jszip` - ZIP file handling
  - `jsonpath-plus` - JSON path queries
  - `@svgdotjs/svg.js` - SVG manipulation

### Main Features
1. **Data Mapper** (Most Complex)
   - Visual entity mapping
   - Source/target data navigation
   - Column mapping configuration
   - Relationship mapping
   - CSV settings
   - Auto-save functionality
   - AI chatbot integration
   - History tracking
   - Export/Import

2. **Data Source Configuration**
   - CSV/XML/JDBC configuration
   - File upload
   - Sample data preview
   - Connection testing
   - Run configurations

3. **Data Chaining**
   - Chain multiple operations
   - Visual workflow
   - Export/Import

4. **Data Management Dashboard**
   - Monitor data imports
   - View execution history
   - Diagram visualization

5. **Tools**
   - Blockly editor
   - JSON conversion tools

### Stores (Pinia)
- `app` - Application state
- `platform-mapping` - Data mapping state
- `data-source-config` - Data source configurations
- `chaining-config` - Chaining configurations
- `cobi-processing` - Processing transactions
- `scripts` - Script management

### Routes
- `/` - Redirect to data-mapper
- `/login` - Login page
- `/menu` - Home menu
- `/data-mapper` - Data mapper index
- `/data-mapper/configuration` - Data mapper edit
- `/data-mapper/data-source-config-creation` - Data source config index
- `/data-mapper/data-source-config-creation/configuration` - Data source config edit
- `/data-chaining` - Data chaining index
- `/data-chaining/configuration` - Data chaining edit
- `/data-management-dashboard` - Dashboard
- `/tools` - Tools index

---

## Migration Strategy

### Phase 1: Setup & Foundation (Day 1)
**Goal**: Create package structure and setup dependencies

#### Tasks:
1. ✅ Create `@cyoda/cobi-react` package structure
2. ✅ Setup package.json with dependencies
3. ✅ Configure TypeScript
4. ✅ Configure Vite
5. ✅ Setup testing infrastructure
6. ✅ Create basic App component
7. ✅ Setup routing structure

#### Dependencies to Install:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "@tanstack/react-query": "^5.14.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "blockly": "^11.2.1",
    "cytoscape": "^3.31.0",
    "react-cytoscapejs": "^2.0.0",
    "filepond": "^4.32.7",
    "react-filepond": "^7.1.2",
    "csv-parse": "^5.6.0",
    "csv-stringify": "^6.5.2",
    "fast-xml-parser": "^4.5.1",
    "crypto-js": "^4.2.0",
    "file-saver": "^2.0.5",
    "jszip": "^3.10.1",
    "jsonpath-plus": "^10.2.0",
    "@cyoda/ui-lib-react": "workspace:*",
    "@cyoda/http-api-react": "workspace:*"
  }
}
```

---

## Phase 2: Type Definitions & Stores (Day 1-2)
**Goal**: Migrate type definitions and create Zustand stores

#### Tasks:
1. ⏳ Migrate TypeScript types
2. ⏳ Create Zustand stores:
   - `appStore` - Application state
   - `dataMappingStore` - Data mapping state
   - `dataSourceConfigStore` - Data source configurations
   - `chainingConfigStore` - Chaining configurations
   - `processingStore` - Processing transactions
   - `scriptsStore` - Script management
3. ⏳ Create React Query hooks for API operations

---

## Phase 3: Core Pages - Data Mapper (Day 2-4)
**Goal**: Migrate the main Data Mapper feature

#### Tasks:
1. ⏳ Create DataMapperIndex page
2. ⏳ Create DataMapperEdit page with steps:
   - Upload File step
   - CSV Settings step
   - Select Entity step
   - Data Mapping step
3. ⏳ Migrate DataMapper component (main visual mapper)
4. ⏳ Migrate supporting components:
   - NavigationEntity
   - ActiveRelationInformation
   - DialogEntityMapping
   - DialogContentEditor
   - DialogUploadFile
   - DialogCSVSettings
   - MetaParams
   - CyodaHistory
5. ⏳ Implement auto-save functionality
6. ⏳ Implement export/import

---

## Phase 4: Data Source Configuration (Day 5-6)
**Goal**: Migrate Data Source Configuration feature

#### Tasks:
1. ⏳ Create DataSourceConfigIndex page
2. ⏳ Create DataSourceConfigEdit page
3. ⏳ Migrate components:
   - DataSourceConfigForm
   - FileUploadDialog
   - SampleDataPreview
   - ConnectionTester
4. ⏳ Implement CSV/XML/JDBC configuration
5. ⏳ Implement file upload with FilePond

---

## Phase 5: Data Chaining (Day 6-7)
**Goal**: Migrate Data Chaining feature

#### Tasks:
1. ⏳ Create DataChainingIndex page
2. ⏳ Create DataChainingEdit page
3. ⏳ Migrate chaining components
4. ⏳ Implement visual workflow

---

## Phase 6: Dashboard & Tools (Day 7-8)
**Goal**: Migrate Dashboard and Tools

#### Tasks:
1. ⏳ Create DataManagementDashboard page
2. ⏳ Migrate dashboard components
3. ⏳ Create Tools page
4. ⏳ Integrate Blockly editor

---

## Phase 7: Testing (Day 8-9)
**Goal**: Comprehensive testing

#### Tasks:
1. ⏳ Write unit tests for stores
2. ⏳ Write unit tests for hooks
3. ⏳ Write component tests
4. ⏳ Write integration tests
5. ⏳ Write E2E tests for critical flows

---

## Phase 8: Polish & Documentation (Day 9-10)
**Goal**: Final polish and documentation

#### Tasks:
1. ⏳ Fix any remaining bugs
2. ⏳ Optimize performance
3. ⏳ Write comprehensive README
4. ⏳ Create migration guide
5. ⏳ Document API hooks
6. ⏳ Document components

---

## Key Challenges

1. **Blockly Integration** - Need to integrate Blockly with React
2. **Complex State Management** - Data mapper has complex nested state
3. **Auto-Save** - Need to implement auto-save with React
4. **File Upload** - FilePond integration with React
5. **AI Chatbot** - Need to migrate or integrate chatbot
6. **Visual Mapping** - Complex visual interface for data mapping

---

## Success Criteria

- ✅ All features migrated and functional
- ✅ All tests passing (target: 100+ tests)
- ✅ Comprehensive documentation
- ✅ Performance equivalent or better than Vue version
- ✅ Code quality and maintainability improved

---

## Progress Tracking

**Overall Progress**: 5% (Setup started)

- [ ] Phase 1: Setup & Foundation (0%)
- [ ] Phase 2: Type Definitions & Stores (0%)
- [ ] Phase 3: Core Pages - Data Mapper (0%)
- [ ] Phase 4: Data Source Configuration (0%)
- [ ] Phase 5: Data Chaining (0%)
- [ ] Phase 6: Dashboard & Tools (0%)
- [ ] Phase 7: Testing (0%)
- [ ] Phase 8: Polish & Documentation (0%)

