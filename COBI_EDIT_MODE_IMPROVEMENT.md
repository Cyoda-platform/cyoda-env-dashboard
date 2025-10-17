# COBI Edit Mode Improvement

**Date**: 2025-10-17
**Feature**: Hide step wizard when editing existing configurations
**Status**: ✅ Complete

---

## Problem

When editing an existing Data Mapper configuration, the step-by-step wizard (Steps 0-4) was still visible, which was confusing because:

1. **Steps are for creation**: The wizard is designed to guide users through creating a NEW configuration
2. **Unnecessary navigation**: Users editing existing configs don't need to go through steps
3. **Poor UX**: Seeing "Step 1: Upload File", "Step 2: CSV Settings", etc. when editing is misleading
4. **Wasted space**: The Steps component takes up valuable screen real estate

**User Feedback**: "I think that the steps for creating a configuration shouldn't be visible on the configuration page itself."

---

## Solution

Implemented **Edit Mode** detection that:

1. **Detects edit mode**: Checks if user is editing existing config (has `id` parameter)
2. **Hides step wizard**: Removes Steps component when in edit mode
3. **Shows DataMapper directly**: Skips to the mapping interface immediately
4. **Different UI for editing**: Shows "Edit Data Mapping Configuration" with "Save Changes" button

---

## Implementation

### 1. Edit Mode Detection

Added logic to determine if we're editing an existing configuration:

```typescript
// Determine if we're in edit mode (editing existing config)
const isEditMode = id && existingMapping;
```

### 2. Auto-Skip to Mapper View

When loading an existing configuration, automatically skip to Step 4 (DataMapper):

```typescript
// If editing existing mapping (has ID), skip to the mapper view
if (id && dataToLoad.id) {
  setCurrentStep(4); // Go directly to Step 4 (Data Mapping)
}
```

### 3. Conditional Steps Display

Only show the Steps component when creating a new configuration:

```tsx
{/* Only show steps when creating new configuration */}
{!isEditMode && (
  <Steps
    current={currentStep}
    items={steps}
    style={{ marginTop: '24px', marginBottom: '32px' }}
  />
)}
```

### 4. Conditional Content Rendering

Show different content based on mode:

```tsx
{/* When editing, show DataMapper directly */}
{isEditMode ? (
  <div style={{ width: '100%' }}>
    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>Data Mapping Configuration</Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Edit your data mapping configuration.
        </Paragraph>
      </div>
      <Space>
        <Button onClick={() => navigate('/data-mapper')}>Cancel</Button>
        <Button type="primary" onClick={handleSaveMapping}>
          Save Changes
        </Button>
      </Space>
    </div>

    <DataMapper {...props} />
  </div>
) : (
  <>
    {/* Step 0: Default Settings */}
    {currentStep === 0 && (...)}
    
    {/* Step 1: Upload File */}
    {currentStep === 1 && (...)}
    
    {/* Step 2: CSV Settings */}
    {currentStep === 2 && (...)}
    
    {/* Step 3: Select Entity */}
    {currentStep === 3 && (...)}
    
    {/* Step 4: Data Mapping */}
    {currentStep === 4 && (...)}
  </>
)}
```

---

## Changes Made

### File: `DataMapperEdit.tsx`

**Line 53-85**: Added auto-skip logic when loading existing mapping
```typescript
// If editing existing mapping (has ID), skip to the mapper view
if (id && dataToLoad.id) {
  setCurrentStep(4); // Go directly to Step 4 (Data Mapping)
}
```

**Line 242-244**: Added edit mode detection
```typescript
// Determine if we're in edit mode (editing existing config)
const isEditMode = id && existingMapping;
```

**Line 255-262**: Conditional Steps display
```tsx
{!isEditMode && (
  <Steps current={currentStep} items={steps} />
)}
```

**Line 264-327**: Edit mode UI (DataMapper directly)
- Clean header with "Edit Data Mapping Configuration" title
- "Save Changes" button instead of "Next/Previous"
- Full-width DataMapper component
- Disabled certain actions (upload file, edit CSV settings)

**Line 328-604**: Creation mode UI (Step wizard)
- All 5 steps wrapped in fragment `<>`
- Only shown when `!isEditMode`

---

## User Experience Comparison

### Before (Confusing)

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Data Mapper Configuration          [Back to List]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ● ─────── ● ─────── ● ─────── ● ─────── ●                  │
│ Default   Upload    CSV       Select    Data                │
│ Settings  File      Settings  Entity    Mapping             │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Step 4: Data Mapping                                    │ │
│ │                                                          │ │
│ │ [Previous]                              [Save Mapping]  │ │
│ │                                                          │ │
│ │ DataMapper Component                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Issues:
- ❌ Steps visible when editing
- ❌ "Previous" button (goes where?)
- ❌ Confusing navigation
- ❌ Wasted space
```

### After (Clean)

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Data Mapper Configuration          [Back to List]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Data Mapping Configuration                                  │
│ Edit your data mapping configuration.                       │
│                                          [Cancel] [Save Changes]
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │ DataMapper Component (Full Width)                       │ │
│ │                                                          │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Benefits:
- ✅ No steps when editing
- ✅ Clear "Save Changes" action
- ✅ More space for mapper
- ✅ Better UX
```

---

## Behavior

### Creating New Configuration

1. User clicks "Create New" from Data Mapper list
2. URL: `/data-mapper/create`
3. Shows: Step wizard (Steps 0-4)
4. User goes through each step sequentially
5. Final step shows DataMapper with "Save Mapping" button

### Editing Existing Configuration

1. User clicks "Edit" on existing configuration
2. URL: `/data-mapper/edit/:id`
3. Loads existing configuration data
4. **Automatically skips to DataMapper view**
5. **Hides step wizard**
6. Shows: DataMapper directly with "Save Changes" button
7. User can edit mappings and save

### Copying Configuration

1. User clicks "Copy" on existing configuration
2. URL: `/data-mapper/create` (with state)
3. Shows: Step wizard (same as creating new)
4. Pre-fills data from copied configuration
5. User can modify and save as new

---

## Edge Cases Handled

### 1. Loading State
```typescript
if (id && isLoadingMapping) {
  return <Spin size="large" tip="Loading mapping configuration..." />;
}
```

### 2. Missing Data
```typescript
const isEditMode = id && existingMapping; // Both must exist
```

### 3. Disabled Actions in Edit Mode
```typescript
onUploadFile={() => {
  message.info('Cannot upload file when editing existing configuration');
}}
onEditCSVSettings={() => {
  message.info('Cannot edit CSV settings when editing existing configuration');
}}
```

---

## Testing

### Test Case 1: Create New Configuration
```
1. Navigate to /data-mapper
2. Click "Create New"
✅ Should show Step 0 (Default Settings)
✅ Should show Steps component
✅ Should allow navigation through steps
```

### Test Case 2: Edit Existing Configuration
```
1. Navigate to /data-mapper
2. Click "Edit" on existing config
✅ Should NOT show Steps component
✅ Should show DataMapper directly
✅ Should show "Save Changes" button
✅ Should load existing data
```

### Test Case 3: Copy Configuration
```
1. Navigate to /data-mapper
2. Click "Copy" on existing config
✅ Should show Step 0 (Default Settings)
✅ Should show Steps component
✅ Should pre-fill data from copied config
```

---

## Benefits

1. **✅ Cleaner UI**: No unnecessary steps when editing
2. **✅ Better UX**: Direct access to mapper when editing
3. **✅ More Space**: Full width for DataMapper component
4. **✅ Clear Intent**: "Save Changes" vs "Save Mapping"
5. **✅ Faster Workflow**: Skip steps when editing
6. **✅ Less Confusion**: Steps only shown when creating

---

## Files Modified

- `react-project/packages/cobi-react/src/pages/DataMapper/DataMapperEdit.tsx`
  - Added edit mode detection
  - Conditional Steps display
  - Conditional content rendering
  - Auto-skip to DataMapper when editing

---

## Status

**✅ Complete**: The step wizard is now hidden when editing existing configurations, and users are taken directly to the DataMapper interface.

The application is running at http://localhost:3009/ and the changes have been hot-reloaded.

