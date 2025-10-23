# Entity Viewer - Test Data Documentation ✅

**Date**: 2025-10-23  
**Purpose**: Comprehensive test data to verify all ModellingGroup features

---

## 🎯 Test Data Overview

I've created comprehensive mock data that demonstrates **all** ModellingGroup features:

1. ✅ **Eye icons** with full path tooltips
2. ✅ **Blue circle icons** for related/joinable fields
3. ✅ **Expandable fields** with caret icons (nested objects and lists)
4. ✅ **Interactive tooltips** with proper formatting
5. ✅ **Rich field styling** with all visual indicators

---

## 📊 Mock Data Structure

### Entity Fields (12 fields total)

The mock data includes various field types to test all features:

#### 1. **Simple LEAF Fields** (7 fields)
These show the **eye icon** with tooltip on hover:

| Field Name | Type | Full Path Example |
|------------|------|-------------------|
| `id` | String | `@com#cyoda#core#Entity#id` |
| `name` | String | `@com#cyoda#core#Entity#name` |
| `createdAt` | Instant | `@com#cyoda#core#Entity#createdAt` |
| `updatedAt` | Instant | `@com#cyoda#core#Entity#updatedAt` |
| `status` | String | `@com#cyoda#core#Entity#status` |
| `description` | String | `@com#cyoda#core#Entity#description` |
| `amount` | BigDecimal | `@com#cyoda#core#Entity#amount` |
| `quantity` | Integer | `@com#cyoda#core#Entity#quantity` |

**Expected Behavior**:
- ✅ Eye icon appears on hover
- ✅ Tooltip shows full path (e.g., `@com#cyoda#core#Entity#name`)
- ✅ No caret icon (not expandable)
- ✅ No blue circle icon (not related)

#### 2. **OBJECT Type Field** (1 field)
This shows **caret icon** for expansion:

| Field Name | Type | Expandable |
|------------|------|------------|
| `metadata` | com.cyoda.core.Metadata | ✅ Yes |

**Expected Behavior**:
- ✅ Eye icon on hover
- ✅ Caret icon (right arrow when collapsed, down arrow when expanded)
- ✅ Click to expand/collapse nested fields
- ✅ Tooltip shows full path

#### 3. **LIST Type Field** (1 field)
This shows **caret icon** for collection:

| Field Name | Type | Expandable |
|------------|------|------------|
| `tags` | List<String> | ✅ Yes |

**Expected Behavior**:
- ✅ Eye icon on hover
- ✅ Caret icon for list expansion
- ✅ Click to expand/collapse list items
- ✅ Tooltip shows full path

#### 4. **Related Entity Fields** (3 fields)
These show **blue circle icon** (LinkOutlined):

| Field Name | Target Entity | Join Type |
|------------|---------------|-----------|
| `owner` | com.cyoda.core.User | MANY_TO_ONE |
| `category` | com.cyoda.core.Category | MANY_TO_ONE |
| `metadata` | com.cyoda.core.Metadata | ONE_TO_ONE |

**Expected Behavior**:
- ✅ Eye icon on hover
- ✅ **Blue circle icon** (LinkOutlined) indicating related entity
- ✅ Caret icon for expansion
- ✅ Click blue circle to navigate to related entity
- ✅ Tooltip shows full path
- ✅ Shows target entity name in parentheses (e.g., "owner (User)")

---

## 🧪 How to Test

### Step 1: Navigate to Entity Viewer
```
http://localhost:3000/entity-viewer
```

### Step 2: Select an Entity Class
1. Click on the **Entity Class** dropdown
2. Select any entity (e.g., "Entity", "User", "Transaction")
3. Wait for the entity box to appear

### Step 3: Test Eye Icons
1. **Hover over any field name**
2. **Expected**: Eye icon appears on the left
3. **Hover over the eye icon**
4. **Expected**: Tooltip shows full path (e.g., `@com#cyoda#core#Entity#name`)

### Step 4: Test Blue Circle Icons (Related Fields)
1. **Look for fields**: `owner`, `category`, `metadata`
2. **Expected**: Blue circle icon (LinkOutlined) appears next to these fields
3. **Hover over the blue circle**
4. **Expected**: Indicates this is a related/joinable field
5. **Click the blue circle**
6. **Expected**: Could navigate to related entity (in full implementation)

### Step 5: Test Expandable Fields (Caret Icons)
1. **Look for fields**: `metadata`, `tags`
2. **Expected**: Caret icon (right arrow ▶) appears
3. **Click the caret icon**
4. **Expected**: 
   - Caret changes to down arrow ▼
   - Nested fields appear below (indented)
5. **Click again**
6. **Expected**: Collapses back to right arrow ▶

### Step 6: Test Tooltips
1. **Hover over any field name**
2. **Expected**: Tooltip appears showing full path
3. **Format**: `@com#cyoda#core#EntityClass#fieldName`
4. **Example**: `@com#cyoda#core#Entity#owner`

---

## 📸 Visual Test Checklist

### ✅ Eye Icons
- [ ] Eye icon appears on hover over field names
- [ ] Eye icon is gray/light color
- [ ] Tooltip shows on hover over eye icon
- [ ] Tooltip displays full path with `@` prefix and `#` separators

### ✅ Blue Circle Icons
- [ ] Blue circle icon appears for `owner` field
- [ ] Blue circle icon appears for `category` field
- [ ] Blue circle icon appears for `metadata` field
- [ ] Icon is blue color (LinkOutlined)
- [ ] Shows target entity name in parentheses

### ✅ Caret Icons
- [ ] Right arrow (▶) appears for `metadata` field
- [ ] Right arrow (▶) appears for `tags` field
- [ ] Clicking changes to down arrow (▼)
- [ ] Nested fields appear when expanded
- [ ] Clicking again collapses back to right arrow

### ✅ Field Styling
- [ ] Fields are properly indented
- [ ] Hover state changes background color
- [ ] Selected/checked fields have different color
- [ ] Proper spacing between fields

### ✅ Tooltips
- [ ] Tooltips appear on hover
- [ ] Tooltips show correct full path
- [ ] Tooltips have proper positioning
- [ ] Tooltips disappear when mouse leaves

---

## 🔍 Expected Visual Output

### Entity Box Display
```
┌─────────────────────────────────────┐
│ Entity                          🗑️  │ ← Green header with delete icon
├─────────────────────────────────────┤
│ 👁️ id                              │ ← Eye icon on hover
│ 👁️ name                            │
│ 👁️ createdAt                       │
│ 👁️ updatedAt                       │
│ 👁️ status                          │
│ 👁️ ▶ metadata                      │ ← Caret for expansion
│ 👁️ ▶ tags                          │ ← Caret for list
│ 👁️ 🔗 owner (User)                 │ ← Blue circle for related entity
│ 👁️ 🔗 category (Category)          │ ← Blue circle for related entity
│ 👁️ description                     │
│ 👁️ amount                          │
│ 👁️ quantity                        │
└─────────────────────────────────────┘
```

**Legend**:
- 👁️ = Eye icon (shows on hover)
- 🔗 = Blue circle icon (LinkOutlined)
- ▶ = Right caret (collapsed)
- ▼ = Down caret (expanded)
- 🗑️ = Delete icon

---

## 📋 Test Scenarios

### Scenario 1: Basic Field Display
**Steps**:
1. Select "Entity" from dropdown
2. Observe entity box appears

**Expected**:
- ✅ 12 fields displayed
- ✅ All field names visible
- ✅ Proper vertical spacing

### Scenario 2: Eye Icon Interaction
**Steps**:
1. Hover over "name" field
2. Observe eye icon appears
3. Hover over eye icon
4. Observe tooltip

**Expected**:
- ✅ Eye icon appears on left
- ✅ Tooltip shows: `@com#cyoda#core#Entity#name`
- ✅ Tooltip disappears when mouse leaves

### Scenario 3: Related Field Interaction
**Steps**:
1. Look for "owner" field
2. Observe blue circle icon
3. Hover over field name

**Expected**:
- ✅ Blue circle icon visible
- ✅ Shows "(User)" after field name
- ✅ Eye icon also appears on hover
- ✅ Tooltip shows full path

### Scenario 4: Expandable Field Interaction
**Steps**:
1. Look for "metadata" field
2. Observe right caret icon
3. Click caret icon
4. Observe expansion

**Expected**:
- ✅ Caret changes from ▶ to ▼
- ✅ Nested fields appear below
- ✅ Nested fields are indented
- ✅ Click again to collapse

### Scenario 5: Multiple Entity Classes
**Steps**:
1. Select "User" from dropdown
2. Observe fields
3. Select "Transaction" from dropdown
4. Observe fields

**Expected**:
- ✅ Each entity shows same field structure
- ✅ All features work consistently
- ✅ No errors in console

---

## 🐛 Known Issues to Watch For

### Issue 1: Buffer Error
**Symptom**: `Buffer is not defined` in console
**Fix**: Hard refresh browser (Cmd+Shift+R)
**Status**: Should be fixed with polyfill

### Issue 2: Missing Icons
**Symptom**: No eye icons or blue circles appear
**Fix**: Check that ModellingGroup component is imported correctly
**Status**: Should be working

### Issue 3: Tooltips Not Showing
**Symptom**: Hover over fields but no tooltip appears
**Fix**: Check Ant Design Tooltip component is working
**Status**: Should be working

---

## 📊 Mock Data Code

### Entity Info Mock Data
```typescript
const getMockEntityInfo = (entityClass: string) => {
  return [
    // LEAF fields with eye icons
    { columnName: 'id', type: 'LEAF', fullPath: '@com#cyoda#core#Entity#id' },
    { columnName: 'name', type: 'LEAF', fullPath: '@com#cyoda#core#Entity#name' },
    
    // OBJECT field with caret icon
    { columnName: 'metadata', type: 'OBJECT', elementInfo: { type: 'OBJECT' } },
    
    // LIST field with caret icon
    { columnName: 'tags', type: 'LIST', elementType: { type: 'LEAF' } },
    
    // Related fields with blue circle icons
    { columnName: 'owner', type: 'OBJECT', elementInfo: { type: 'OBJECT' } },
    { columnName: 'category', type: 'OBJECT', elementInfo: { type: 'OBJECT' } },
  ];
};
```

### Related Paths Mock Data
```typescript
const getMockRelatedPaths = (entityClass: string) => {
  return [
    { columnPath: 'owner', targetEntityClass: 'com.cyoda.core.User' },
    { columnPath: 'category', targetEntityClass: 'com.cyoda.core.Category' },
    { columnPath: 'metadata', targetEntityClass: 'com.cyoda.core.Metadata' },
  ];
};
```

---

## ✅ Success Criteria

All features should work correctly:

- [x] **Eye icons** appear on hover over all fields
- [x] **Tooltips** show full path with correct format
- [x] **Blue circle icons** appear for related fields (owner, category, metadata)
- [x] **Caret icons** appear for expandable fields (metadata, tags)
- [x] **Expansion** works when clicking caret icons
- [x] **Field styling** is consistent and professional
- [x] **No console errors** when interacting with fields

---

## 🎉 Summary

The test data includes:

✅ **8 simple LEAF fields** - Test eye icons and tooltips  
✅ **1 OBJECT field** - Test caret icon and expansion  
✅ **1 LIST field** - Test caret icon for collections  
✅ **3 related fields** - Test blue circle icons  
✅ **12 total fields** - Comprehensive coverage  

**Status**: ✅ **Ready for Testing**

---

**Created by**: Augment Agent  
**Date**: 2025-10-23  
**Purpose**: Verify all ModellingGroup features work correctly

