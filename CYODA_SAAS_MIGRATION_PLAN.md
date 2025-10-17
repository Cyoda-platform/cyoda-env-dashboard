# Cyoda-SaaS Package Migration Plan

**Package**: @cyoda/cyoda-sass → @cyoda/cyoda-sass-react  
**Status**: 🟡 Ready to Start  
**Priority**: P1 (High) - Final Main Application  
**Estimated Time**: 3-5 days  
**Start Date**: 2025-10-17  

---

## 📋 Package Overview

The **cyoda-sass** package is a SaaS application focused on **Trino SQL schema management**. It provides a user interface for creating, editing, and managing SQL schemas with table and field configurations. This is the **10th and final package** in the migration project.

### Key Features:
- **Trino Schema Management** - Create and edit SQL schemas
- **Table Configuration** - Manage tables with fields, types, and constraints
- **Model Integration** - Import entity models from the system
- **AI Chatbot Integration** - AI-powered schema assistance
- **Field Validation** - Regex-based field name validation
- **Hidden Fields/Tables** - Soft delete functionality
- **Auto-save State** - Table state persistence

---

## 📊 Package Analysis

### Current Structure (Vue 3)

```
.old_project/packages/cyoda-sass/
├── src/
│   ├── App.vue                          # Main app component
│   ├── main.ts                          # Entry point
│   ├── views/
│   │   ├── LoginView.vue                # Login page
│   │   └── Trino/
│   │       ├── TrinoIndex.vue           # Schema list page
│   │       ├── TrinoEdit.vue            # Schema edit page
│   │       ├── TrinoEdit/
│   │       │   └── TrinoEditTable.vue   # Table editor component
│   │       ├── TrinoModelsPopUp.vue     # Model selection dialog
│   │       ├── TrinoHiddenFieldsPopUp.vue
│   │       ├── TrinoHiddenTablesPopUp.vue
│   │       └── TrinoIndexCreatePopUp.vue
│   ├── components/
│   │   ├── CyodaButton/                 # Custom button component
│   │   ├── CyodaHeader/                 # Header component
│   │   ├── CyodaSidebar/                # Sidebar navigation
│   │   └── CyodaFooter/                 # Footer component
│   ├── layout/
│   │   ├── CyodaLayoutDefault.vue       # Default layout
│   │   ├── CyodaLayoutSidebar.vue       # Sidebar layout
│   │   └── CyodaLayoutLogin.vue         # Login layout
│   ├── stores/
│   │   ├── app.ts                       # App state (menu, toggle)
│   │   └── sql-schema.ts                # SQL schema API calls
│   ├── router/
│   │   ├── index.ts                     # Router setup
│   │   └── routes.ts                    # Route definitions
│   ├── plugins/
│   │   ├── element-ui.ts                # Element Plus setup
│   │   ├── fontawesome.ts               # Font Awesome setup
│   │   └── installation.js              # Plugin installer
│   └── assets/
│       ├── css/                         # SCSS styles
│       └── images/                      # Images
└── package.json
```

### Component Count:
- **Pages**: 2 (TrinoIndex, TrinoEdit)
- **Dialogs**: 4 (ModelsPopUp, HiddenFieldsPopUp, HiddenTablesPopUp, IndexCreatePopUp)
- **Components**: 5 (Button, Header, Sidebar, Footer, TrinoEditTable)
- **Layouts**: 3 (Default, Sidebar, Login)
- **Stores**: 2 (app, sql-schema)
- **Routes**: 3 routes

**Total Files to Migrate**: ~20 files (~2,000 lines of code)

---

## 🎯 Migration Strategy

### Phase 1: Setup & Foundation (Day 1 - Morning)
**Estimated Time**: 2-3 hours

1. ✅ Create package structure
2. ✅ Setup package.json with dependencies
3. ✅ Configure TypeScript and Vite
4. ✅ Create type definitions
5. ✅ Setup main entry point and App component
6. ✅ Configure routes

### Phase 2: Stores & API Layer (Day 1 - Afternoon)
**Estimated Time**: 2-3 hours

1. ✅ Migrate app store (Zustand)
2. ✅ Create SQL schema API service
3. ✅ Create React Query hooks for:
   - `useSchemas()` - List all schemas
   - `useSchema(id)` - Get schema by ID
   - `useCreateSchema()` - Create schema
   - `useUpdateSchema()` - Update schema
   - `useDeleteSchema()` - Delete schema
   - `useEntityModels()` - Get entity models
   - `useGenerateTables()` - Generate tables
   - `useUpdateTables()` - Update tables

### Phase 3: Layout Components (Day 2 - Morning)
**Estimated Time**: 2-3 hours

1. ✅ Migrate layouts (use existing from ui-lib-react)
2. ✅ Migrate Header component
3. ✅ Migrate Sidebar component
4. ✅ Migrate Footer component
5. ✅ Create custom Button component (if needed)

### Phase 4: Main Pages (Day 2 - Afternoon)
**Estimated Time**: 3-4 hours

1. ✅ Migrate LoginView page
2. ✅ Migrate TrinoIndex page (schema list)
   - Table with filtering
   - Pagination
   - Create/Edit/Delete actions
   - State persistence
3. ✅ Migrate TrinoEdit page (schema editor)
   - Form validation
   - Tabs for tables
   - Field management
   - AI Chatbot integration

### Phase 5: Dialog Components (Day 3 - Morning)
**Estimated Time**: 2-3 hours

1. ✅ Migrate TrinoModelsPopUp
2. ✅ Migrate TrinoHiddenFieldsPopUp
3. ✅ Migrate TrinoHiddenTablesPopUp
4. ✅ Migrate TrinoIndexCreatePopUp (if needed)

### Phase 6: Table Editor Component (Day 3 - Afternoon)
**Estimated Time**: 2-3 hours

1. ✅ Migrate TrinoEditTable component
   - Field list with types
   - Add/Remove fields
   - Flatten array fields
   - Validation

### Phase 7: Testing (Day 4)
**Estimated Time**: 4-6 hours

1. ✅ Write unit tests for stores
2. ✅ Write unit tests for hooks
3. ✅ Write component tests
4. ✅ Write integration tests
5. ✅ Fix any bugs found

### Phase 8: Polish & Documentation (Day 5)
**Estimated Time**: 2-3 hours

1. ✅ Create comprehensive README
2. ✅ Add JSDoc comments
3. ✅ Final code review
4. ✅ Build and verify

---

## 📦 Dependencies

### Core Dependencies:
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `react-router-dom` ^6.26.2
- `antd` ^5.21.2
- `@tanstack/react-query` ^5.59.16
- `zustand` ^5.0.0

### Cyoda Packages:
- `@cyoda/ui-lib-react` (layouts, components)
- `@cyoda/http-api-react` (axios, API utilities)

### Additional Dependencies:
- `moment` ^2.30.1 (date formatting)
- `uuid` ^11.0.5 (ID generation)
- `lodash` ^4.17.21 (utilities)
- `file-saver` ^2.0.5 (file downloads)
- `@fortawesome/react-fontawesome` (icons)

### Dev Dependencies:
- `vitest` ^3.0.3
- `@testing-library/react` ^16.0.1
- `@testing-library/user-event` ^14.5.2
- `typescript` ^5.7.3
- `vite` ^6.0.11

---

## 🔑 Key Migration Considerations

### 1. **AI Chatbot Integration**
- The package uses `AIChatBot` component from ui-lib
- Need to migrate or use existing React version
- Chatbot state management with Zustand

### 2. **Table State Persistence**
- Uses `useTableSaveStateMixin` for saving table state
- Migrate to custom React hook with localStorage

### 3. **Field Validation**
- Complex regex validation for field names
- Schema name validation
- Unique table name validation
- Need to implement with React Hook Form or Ant Design Form

### 4. **Hidden Fields/Tables**
- Soft delete functionality (hidden flag)
- Need to maintain in React state

### 5. **Dynamic Tabs**
- Tabs for each table in schema
- Active tab state management

### 6. **Flatten Array Fields**
- Recursive field structure for nested arrays
- Need to handle in React component tree

---

## 📝 Type Definitions

```typescript
// Core types to define
interface SqlSchema {
  id: string | null;
  schemaName: string;
  tables: SqlTable[];
  timestamp?: number;
}

interface SqlTable {
  metadataClassId: string;
  tableName: string;
  uniformedPath: string;
  fields: SqlField[];
  hidden?: boolean;
  modelUpdateDate?: number;
}

interface SqlField {
  fieldName: string;
  fieldType: string;
  flatten?: boolean;
  arrayFields?: SqlField[];
  hidden?: boolean;
}

interface EntityModel {
  id: string;
  name: string;
  // ... other properties
}
```

---

## ✅ Success Criteria

1. ✅ All pages render correctly
2. ✅ CRUD operations work for schemas
3. ✅ Table and field management functional
4. ✅ Validation works correctly
5. ✅ Hidden fields/tables work
6. ✅ AI Chatbot integration works
7. ✅ State persistence works
8. ✅ All tests passing (target: 40+ tests)
9. ✅ Build successful
10. ✅ Documentation complete

---

## 🚀 Next Steps

1. Create package structure
2. Setup dependencies
3. Create type definitions
4. Migrate stores and API layer
5. Migrate pages and components
6. Write tests
7. Polish and document

---

**Estimated Completion**: 3-5 days  
**Complexity**: Medium (simpler than COBI, similar to source-configuration)  
**Risk Level**: Low (well-defined scope, existing patterns)

