# Tableau Reports - Feature Analysis & Migration Status

## 📊 Overview

This document analyzes the **Report Creation**, **Stream Reports**, and **Running Reports** functionality in both the old Vue project and the new React project.

---

## 🔍 Current Status Summary

| Feature | Vue (Old) | React (New) | Status |
|---------|-----------|-------------|--------|
| **View Report History** | ✅ Complete | ✅ Complete | ✅ MIGRATED |
| **Filter Reports** | ✅ Complete | ✅ Complete | ✅ MIGRATED |
| **View Report Groups** | ✅ Complete | ✅ Complete | ✅ MIGRATED |
| **View Report Rows** | ✅ Complete | ✅ Complete | ✅ MIGRATED |
| **Create New Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Edit Report Config** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Run Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Quick Run Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Cancel Running Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Clone/Save As Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Delete Report** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Stream Reports** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |
| **Export/Import Reports** | ✅ Complete | ❌ Missing | ⚠️ NOT MIGRATED |

**Overall Completion**: ~35% (4/12 major features)

---

## 📁 Vue Project Structure (Old)

### Main Views

#### 1. **ConfigEditor.vue** - Main Report Management Page
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditor.vue`
- **Features**:
  - Tab 1: "Report Config" - List of all report configurations
  - Tab 2: "Reports" - Report history view

#### 2. **ConfigEditorReports.vue** - Report Config List
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReports.vue`
- **Features**:
  - ✅ Create New Report button
  - ✅ Export/Import functionality
  - ✅ Filter reports by name, description, type, user, date
  - ✅ Table with columns: Config, Description, Type, User, Created
  - ✅ Actions per row:
    - Edit (pencil icon) - Opens ConfigEditorSimple
    - Clone/Save As (copy icon) - Duplicate report
    - Run (play icon) - Execute report
    - Cancel (stop icon) - Cancel running report
    - Delete (trash icon) - Delete report

#### 3. **ConfigEditorSimple.vue** - Report Editor
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditorSimple.vue`
- **Features**:
  - Tab 1: **Model** - Select entity class and model
  - Tab 2: **Columns** - Select which columns to include
  - Tab 3: **FilterBuilder** - Build complex filters
  - Tab 4: **Sorting** - Configure sorting
  - Tab 5: **Grouping** - Configure grouping
  - Tab 6: **Summary** - Configure aggregations
  - Tab 7: **JSON** - View/edit raw JSON
  - Actions:
    - Back button
    - Update button (save changes)
    - Update and Run button (save + execute)
    - Query Plan button (view execution plan)

#### 4. **ConfigEditorReportsStream.vue** - Stream Reports
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReportsStream.vue`
- **Features**:
  - Create New Stream Report
  - Export/Import stream reports
  - Filter stream reports
  - Run/Cancel stream reports
  - Edit stream report configurations

#### 5. **ConfigEditorStream.vue** - Stream Report Editor
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditorStream.vue`
- **Features**:
  - Similar tabs to ConfigEditorSimple
  - Specialized for stream data reports
  - Real-time data streaming configuration

#### 6. **HistoryReportQuickRun.vue** - Quick Run Widget
- **Location**: `.old_project/packages/http-api/src/views/History/HistoryReportQuickRun.vue`
- **Features**:
  - Dropdown to select report config
  - Run button with dropdown:
    - "Run" - Execute in background
    - "Run and show Result" - Execute and display immediately
  - Edit button - Opens report editor
  - Cancel button - Stop running report
  - Real-time status updates
  - Auto-refresh when report completes

### Dialogs/Popups

#### 1. **ConfigEditorNew.vue** - Create New Report Dialog
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditor/popup/ConfigEditorNew.vue`
- **Features**:
  - 2-step wizard:
    - **Step 1**: Enter Name and Description
    - **Step 2**: Select Entity Class
  - Entity type filtering (BUSINESS/TECHNICAL)
  - Validation rules
  - Creates new report and redirects to editor

#### 2. **ConfigEditorSaveAs.vue** - Clone Report Dialog
- **Location**: `.old_project/packages/http-api/src/views/ConfigEditor/popup/ConfigEditorSaveAs.vue`
- **Features**:
  - Clone existing report with new name
  - Preserves all configuration
  - Creates independent copy

---

## 📁 React Project Structure (Current)

### Existing Components

#### 1. **Reports.tsx** - Main Reports Page ✅
- **Location**: `react-project/packages/tableau-react/src/pages/Reports.tsx`
- **Features**:
  - ✅ HistoryFilter component
  - ✅ HistoryTable component
  - ✅ ReportTableGroup component
  - ✅ ReportTableRows component
  - ❌ No Create/Edit/Run/Delete functionality

#### 2. **HistoryFilter.tsx** ✅
- **Location**: `react-project/packages/tableau-react/src/components/HistoryFilter.tsx`
- **Features**: Filter by authors, states, types, date

#### 3. **HistoryTable.tsx** ✅
- **Location**: `react-project/packages/tableau-react/src/components/HistoryTable.tsx`
- **Features**: Display report history

#### 4. **ReportTableGroup.tsx** ✅
- **Location**: `react-project/packages/tableau-react/src/components/ReportTableGroup.tsx`
- **Features**: Display grouped report data

#### 5. **ReportTableRows.tsx** ✅
- **Location**: `react-project/packages/tableau-react/src/components/ReportTableRows.tsx`
- **Features**: Display report row data

### API Layer (Available) ✅

**Location**: `react-project/packages/http-api-react/src/api/reports.ts`

Available API functions:
- ✅ `getReportConfigs()` - Get report definitions
- ✅ `createReport()` - Create new report
- ✅ `updateReportConfig()` - Update report config
- ✅ `deleteReport()` - Delete report
- ✅ `cancelReport()` - Cancel running report
- ✅ `getReportData()` - Get report rows
- ✅ `exportReport()` - Export report
- ✅ `createReportFromTemplate()` - Clone report
- ✅ `getReportChartData()` - Get chart data
- ✅ `getReportPivotData()` - Get pivot data

### Hooks Layer (Available) ✅

**Location**: `react-project/packages/http-api-react/src/hooks/useReports.ts`

Available hooks:
- ✅ `useReportHistory()` - Report history with pagination
- ✅ `useReportConfig()` - Get report configuration
- ✅ `useCreateReport()` - Create mutation
- ✅ `useUpdateReportConfig()` - Update mutation
- ✅ `useDeleteReport()` - Delete mutation
- ✅ `useCancelReport()` - Cancel mutation
- ✅ `useExportReport()` - Export mutation
- ✅ `useCloneReport()` - Clone mutation

---

## ❌ Missing Components (Need Migration)

### 1. **Report Config Management Page** ⚠️ HIGH PRIORITY
**Vue Source**: `ConfigEditorReports.vue`
**React Target**: `react-project/packages/tableau-react/src/pages/ReportConfigs.tsx` (NEW)

**Features Needed**:
- Create New Report button → Opens CreateReportDialog
- Filter reports table
- Table with actions:
  - Edit → Navigate to ReportEditor
  - Clone → Opens CloneReportDialog
  - Run → Execute report
  - Cancel → Cancel running report
  - Delete → Delete with confirmation
- Export/Import functionality
- Real-time status updates for running reports

### 2. **Create Report Dialog** ⚠️ HIGH PRIORITY
**Vue Source**: `ConfigEditorNew.vue`
**React Target**: `react-project/packages/tableau-react/src/components/CreateReportDialog.tsx` (NEW)

**Features Needed**:
- 2-step wizard (Ant Design Steps component)
- Step 1: Name + Description inputs
- Step 2: Entity Class selection dropdown
- Entity type filtering (BUSINESS/TECHNICAL)
- Form validation
- Create and redirect to editor

### 3. **Report Editor Page** ⚠️ HIGH PRIORITY
**Vue Source**: `ConfigEditorSimple.vue`
**React Target**: `react-project/packages/tableau-react/src/pages/ReportEditor.tsx` (NEW)

**Features Needed**:
- Tabs (Ant Design Tabs):
  1. Model - Entity selection
  2. Columns - Column picker
  3. FilterBuilder - Complex filter builder (ALREADY EXISTS in http-api-react!)
  4. Sorting - Sort configuration
  5. Grouping - Group configuration
  6. Summary - Aggregation configuration
  7. JSON - Raw JSON editor
- Actions:
  - Back button
  - Update button
  - Update and Run button
  - Query Plan button

### 4. **Quick Run Widget** ⚠️ MEDIUM PRIORITY
**Vue Source**: `HistoryReportQuickRun.vue`
**React Target**: `react-project/packages/tableau-react/src/components/QuickRunReport.tsx` (NEW)

**Features Needed**:
- Report config dropdown
- Run button with dropdown menu
- Edit button
- Cancel button
- Real-time status display
- Auto-refresh on completion

### 5. **Stream Reports Page** ⚠️ MEDIUM PRIORITY
**Vue Source**: `ConfigEditorReportsStream.vue`
**React Target**: `react-project/packages/tableau-react/src/pages/StreamReports.tsx` (NEW)

**Features Needed**:
- Similar to ReportConfigs but for stream reports
- Create/Edit/Run/Delete stream reports
- Stream-specific configuration

### 6. **Stream Report Editor** ⚠️ MEDIUM PRIORITY
**Vue Source**: `ConfigEditorStream.vue`
**React Target**: `react-project/packages/tableau-react/src/pages/StreamReportEditor.tsx` (NEW)

**Features Needed**:
- Similar to ReportEditor but for stream reports
- Stream-specific tabs and configuration

### 7. **Clone Report Dialog** ⚠️ LOW PRIORITY
**Vue Source**: `ConfigEditorSaveAs.vue`
**React Target**: `react-project/packages/tableau-react/src/components/CloneReportDialog.tsx` (NEW)

**Features Needed**:
- Simple form with new name input
- Clone button
- Validation

---

## 🎯 Migration Priority

### Phase 1: Core Report Management (HIGH PRIORITY)
1. ✅ **Report Config Management Page** - List, filter, basic actions
2. ✅ **Create Report Dialog** - 2-step wizard
3. ✅ **Quick Run Widget** - Run reports quickly

### Phase 2: Report Editor (HIGH PRIORITY)
4. ✅ **Report Editor Page** - Full editor with all tabs
5. ✅ **Column Picker Component** - Select columns
6. ✅ **Sorting Configuration** - Configure sorting
7. ✅ **Grouping Configuration** - Configure grouping
8. ✅ **Summary Configuration** - Configure aggregations

### Phase 3: Advanced Features (MEDIUM PRIORITY)
9. ✅ **Clone Report Dialog** - Duplicate reports
10. ✅ **Export/Import** - Export/import configurations
11. ✅ **Stream Reports** - Stream report management
12. ✅ **Stream Report Editor** - Stream report configuration

---

## 🔧 Technical Notes

### Available Infrastructure ✅
- ✅ API layer complete (`http-api-react/src/api/reports.ts`)
- ✅ Hooks layer complete (`http-api-react/src/hooks/useReports.ts`)
- ✅ FilterBuilder component exists (`http-api-react/src/components/FilterBuilder`)
- ✅ HelperReportDefinition utility exists
- ✅ HelperReportTable utility exists
- ✅ React Query for state management
- ✅ Ant Design components

### Reusable Components
- ✅ FilterBuilder (from http-api-react) - Can be used in Report Editor
- ✅ EntitySelection (from cobi-react) - Can be used for entity class selection
- ✅ HistoryFilter - Already migrated
- ✅ HistoryTable - Already migrated

### Missing Utilities
- ❌ Report execution status tracking (polling/websocket)
- ❌ Report validation logic
- ❌ Column metadata helpers
- ❌ Sorting/Grouping/Summary helpers

---

## 📝 Recommendations

1. **Start with Report Config Management Page** - This is the entry point for all report operations
2. **Reuse FilterBuilder** - Don't recreate it, import from http-api-react
3. **Use Ant Design Steps** - For the Create Report wizard
4. **Implement Real-time Updates** - Use React Query's refetch intervals for running reports
5. **Add Route Guards** - Prevent navigation away from unsaved report editors
6. **Consider Monaco Editor** - For the JSON tab in Report Editor
7. **Add Confirmation Dialogs** - For destructive actions (delete, cancel)

---

## 🚀 Next Steps

Would you like me to:
1. **Migrate the Report Config Management Page** - The main page for managing reports
2. **Migrate the Create Report Dialog** - The wizard for creating new reports
3. **Migrate the Quick Run Widget** - The quick report execution component
4. **Migrate the Report Editor** - The full report configuration editor

Let me know which component you'd like to tackle first!

