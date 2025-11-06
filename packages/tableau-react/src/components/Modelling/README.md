# CyodaModelling Components

Full-featured entity model browsing and column selection components for React.

## Overview

The CyodaModelling component system provides a comprehensive UI for:
- Browsing entity models in a hierarchical tree structure
- Selecting columns with checkboxes
- Searching and filtering columns
- Managing column definitions (colDefs)
- Managing alias definitions (aliasDefs)

## Components

### Core Components

#### `ModellingPopUp`
Main modal dialog for column selection.

```tsx
import { ModellingPopUp, ModellingPopUpRef } from './components/Modelling';

const popupRef = useRef<ModellingPopUpRef>(null);

<ModellingPopUp
  ref={popupRef}
  requestClass="com.cyoda.tms.model.entities.Transaction"
  checked={selectedColumns}
  onChange={(columns) => setSelectedColumns(columns)}
  limit={10}  // Optional: limit selection
  onlyRange={false}  // Optional: only show range columns
  disablePreview={false}  // Optional: disable preview
/>

// Open the popup
popupRef.current?.open();
```

#### `ModellingColDefs`
Column definitions management with table and actions.

```tsx
import { ModellingColDefs } from './components/Modelling';

<ModellingColDefs
  configDefinition={reportConfig}
  readOnly={false}
/>
```

#### `ModellingAliases`
Alias definitions management.

```tsx
import { ModellingAliases } from './components/Modelling';

<ModellingAliases
  configDefinition={reportConfig}
  readOnly={false}
/>
```

### Tree Components

#### `ModellingGroup`
Renders a list of modelling items.

```tsx
<ModellingGroup
  reportInfoRows={rows}
  relatedPaths={paths}
  requestClass="com.example.Entity"
  checked={selected}
  search="filter"
  isCondenseThePaths={true}
  isOpenAllSelected={false}
/>
```

#### `ModellingItem`
Individual column item with checkbox and expandable children.

#### `ModellingGroupClass`
Renders class-based items (for polymorphic types).

#### `ModellingItemClass`
Individual class item with lazy loading.

### UI Components

#### `ModellingPopUpToggles`
Toggle switches for "Condense the paths" and "Open all selected".

#### `ModellingPopUpSearch`
Search input with debouncing and keyboard shortcuts.

## Features

### Column Selection
- ✅ Hierarchical tree view
- ✅ Checkbox selection with limit support
- ✅ Search with debouncing (min 2 chars)
- ✅ Keyboard shortcut: Press `/` to focus search
- ✅ "Condense the paths" - Show short class names
- ✅ "Open all selected" - Auto-expand selected items
- ✅ Eye icon for preview
- ✅ Expandable/collapsible nodes
- ✅ Lazy loading of child data
- ✅ Join link support
- ✅ Color-coded states

### Column Definitions
- ✅ Add/Remove columns
- ✅ Bulk delete with selection
- ✅ Table display with paths
- ✅ Read-only mode
- ✅ Confirmation dialogs

### Alias Definitions
- ✅ View alias table
- ✅ Edit/Remove aliases
- ✅ Bulk delete
- ✅ Mapper class display
- ✅ Read-only mode

## Data Structures

### ColDef (Column Definition)
```typescript
interface ColDef {
  fullPath: string;  // e.g., "customer.name"
  colType: string;   // e.g., "LEAF", "LIST", "MAP"
  parts?: any;       // Internal structure
}
```

### AliasDef (Alias Definition)
```typescript
interface AliasDef {
  name: string;
  aliasType: string;
  aliasPaths: {
    '@bean': string;
    value: AliasPath[];
  };
}

interface AliasPath {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: string;
}
```

### ReportingInfoRow (Entity Model Row)
```typescript
interface ReportingInfoRow {
  columnName: string;
  columnPath: string;
  type: string;  // "LEAF", "EMBEDDED", "LIST", "MAP"
  declaredClass?: DeclaredClass;
  subClasses?: SubClass[];
  elementType?: ElementInfo;
  elementInfo?: ElementInfo;
  joinInfo?: JoinInfo;
}
```

## API Requirements

The components require these API endpoints:

### Entity Model Info
```
GET /platform-api/entity-info/model-info
  ?entityModel={entityClass}
  &parentFieldType={parentClass}
  &columnPath={path}
  &onlyRange={boolean}

Response: ReportingInfoRow[]
```

### Related Paths (for joins)
```
GET /platform-api/entity-info/model-info/related/paths
  ?entityModel={entityClass}

Response: RelatedPath[]
```

### Catalog Items (aliases)
```
GET /platform-api/catalog/item/class?entityClass={entityClass}
POST /platform-api/catalog/item
PUT /platform-api/catalog/item?itemId={id}
DELETE /platform-api/catalog/item?itemId={id}

Response: CatalogItem[]
```

### Mapper Classes
```
GET /platform-api/catalog/mappers

Response: string[]
```

## Utilities

### HelperModelling
Helper functions for data manipulation:

```typescript
import HelperModelling from './utils/HelperModelling';

// Filter out invalid rows
const filtered = HelperModelling.filterData(rows);

// Sort rows alphabetically
const sorted = HelperModelling.sortData(rows);

// Apply namespace to paths
const namespaced = HelperModelling.applyNameSpace(rows, 'customer');

// Check if row can be selected
const canSelect = HelperModelling.rowCanBeSelected(row);

// Get all request parameters for a row
const params = HelperModelling.allRequestParams(row, requestClass);
```

### modellingStore
Zustand store for search state:

```typescript
import { useModellingStore } from './stores/modellingStore';

const { searchResult, addSearchPath, removeSearchPath, clearSearch } = useModellingStore();
```

## Styling

All components use SCSS modules with Ant Design theming.

### Color Coding
- **Checked paths**: Light blue background (#f0f7ff)
- **Related paths**: Green border (#52c41a)
- **Join links**: Orange icon (#faad14)
- **Generic fields**: Purple background (#f9f0ff)

### Icons
- **Eye**: Preview/view column
- **Caret**: Expand/collapse
- **Link**: Join relationship
- **Plus**: Add new
- **Delete**: Remove

## Examples

### Basic Usage
```tsx
import { ModellingColDefs } from './components/Modelling';

function ReportEditor() {
  const [config, setConfig] = useState({
    requestClass: 'com.example.Customer',
    colDefs: [],
    aliasDefs: [],
  });

  return (
    <div>
      <ModellingColDefs 
        configDefinition={config} 
        readOnly={false} 
      />
    </div>
  );
}
```

### With Aliases
```tsx
import { ModellingColDefs, ModellingAliases } from './components/Modelling';

function FullEditor() {
  return (
    <div>
      <ModellingColDefs configDefinition={config} />
      <hr />
      <ModellingAliases configDefinition={config} />
    </div>
  );
}
```

### Custom Popup
```tsx
import { ModellingPopUp } from './components/Modelling';

function CustomSelector() {
  const popupRef = useRef<ModellingPopUpRef>(null);
  const [selected, setSelected] = useState([]);

  return (
    <>
      <Button onClick={() => popupRef.current?.open()}>
        Select Columns
      </Button>
      
      <ModellingPopUp
        ref={popupRef}
        requestClass="com.example.Entity"
        checked={selected}
        onChange={setSelected}
        limit={5}
      />
    </>
  );
}
```

## Testing

### Mock Server
The test-data/mock-server.mjs includes all required endpoints:

```bash
cd react-project/packages/tableau-react/test-data
node mock-server.mjs
```

### Unit Tests
```bash
npm test -- HelperModelling.test.ts
npm test -- modellingStore.test.ts
```

### Component Tests
```bash
npm test -- ModellingItem.test.tsx
npm test -- ModellingPopUp.test.tsx
```

## Migration Notes

This is a complete migration from Vue to React:
- **Vue 3** → **React 18**
- **Element Plus** → **Ant Design v5**
- **Pinia** → **Zustand**
- **Vue event bus** → **React props/callbacks**

All original functionality has been preserved with the same data structures and API contracts.

## License

Internal use only - Cyoda Platform

