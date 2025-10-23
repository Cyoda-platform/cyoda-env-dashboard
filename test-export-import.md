# Quick Manual Test Guide - Export/Import Feature

## 🚀 Quick Start

1. **Open the app**: http://localhost:3014
2. **Navigate to**: Workflows page
3. **Reset mock data** (if needed):
   - Open browser console (F12)
   - Run: `window.resetMockData()`
   - Refresh page

## ✅ Quick Test Checklist

### Test 1: Basic Export (2 minutes)
- [ ] Select "Order Processing" workflow
- [ ] Click "Export" button
- [ ] Select "JSON" format
- [ ] Click "Export" in dialog
- [ ] **Verify**: File `export_workflows.json` downloads
- [ ] **Open file**: Should contain valid JSON with workflow data

### Test 2: Basic Import (2 minutes)
- [ ] Delete "Order Processing" workflow from table
- [ ] Click "Import" button
- [ ] Upload the exported JSON file
- [ ] **Verify**: Preview shows "Found 1 workflow(s): Order Processing"
- [ ] Click "Import" button
- [ ] **Verify**: Workflow appears back in table
- [ ] **Verify**: Success message appears

### Test 3: Technical Entity (2 minutes)
- [ ] Select "Data Pipeline Processing" workflow
- [ ] Export as JSON
- [ ] Open file and verify:
  - [ ] `entityClassName: "com.cyoda.technical.DataPipeline"`
  - [ ] 6 states (QUEUED, VALIDATING, PROCESSING, COMPLETED, FAILED, RETRY)
  - [ ] 7 transitions
- [ ] Delete workflow
- [ ] Import it back
- [ ] **Verify**: Workflow restored correctly

### Test 4: Multiple Workflows (2 minutes)
- [ ] Select 2-3 workflows
- [ ] Export as JSON
- [ ] **Verify**: File contains all selected workflows
- [ ] Delete all selected workflows
- [ ] Import the file
- [ ] **Verify**: All workflows restored

### Test 5: Validation (2 minutes)
- [ ] Click "Import"
- [ ] Try to upload a text file (not JSON)
- [ ] **Verify**: Error message appears
- [ ] Create file with: `{ "invalid": "data" }`
- [ ] Try to import
- [ ] **Verify**: Validation error appears

### Test 6: Persistence (1 minute)
- [ ] Export a workflow
- [ ] Delete it
- [ ] **Refresh the page** (F5)
- [ ] **Verify**: Workflow still deleted
- [ ] Import the file
- [ ] **Refresh the page** (F5)
- [ ] **Verify**: Workflow still there

### Test 7: ZIP Export (1 minute)
- [ ] Select any workflow
- [ ] Click "Export"
- [ ] Select "ZIP" format
- [ ] Click "Export"
- [ ] **Verify**: File `export_workflows.zip` downloads
- [ ] **Note**: ZIP files cannot be re-imported (by design)

## 🔍 What to Check in Exported JSON

Open the exported JSON file and verify it has this structure:

```json
{
  "workflow": [
    {
      "id": "workflow-001",
      "name": "Order Processing",
      "entityClassName": "com.example.Order",
      "description": "...",
      "enabled": true,
      "active": true,
      "persisted": true,
      "creationDate": 1234567890,
      "states": ["DRAFT", "SUBMITTED", ...],
      "initialState": "DRAFT"
    }
  ],
  "state": [
    {
      "id": "state-001",
      "workflowId": "workflow-001",
      "name": "DRAFT",
      "description": "...",
      "isFinal": false
    },
    ...
  ],
  "transition": [
    {
      "id": "transition-001",
      "workflowId": "workflow-001",
      "name": "Submit Order",
      "fromState": "DRAFT",
      "toState": "SUBMITTED",
      ...
    },
    ...
  ],
  "criteria": [...],
  "process": [...]
}
```

## 🐛 Common Issues & Solutions

### Issue: "Validation failed: data is not an object"
**Cause**: Trying to import HTML instead of JSON (old bug - now fixed)
**Solution**: Make sure you're using the mocked axios (already fixed in code)

### Issue: Workflow disappears after refresh
**Cause**: localStorage not saving
**Solution**: Check browser console for errors, try `window.saveMockData()`

### Issue: Export button disabled
**Cause**: No workflows selected
**Solution**: Select at least one workflow from the table

### Issue: Import shows "Invalid workflow data structure"
**Cause**: JSON file doesn't have required `workflow` array
**Solution**: Use a file exported from the app

## 📝 Browser Console Commands

Useful commands for testing:

```javascript
// Reset all data to defaults
window.resetMockData()

// Save current data
window.saveMockData()

// Load data from localStorage
window.loadMockData()

// Check current workflows
console.log(JSON.parse(localStorage.getItem('mockData')).workflows)
```

## ✅ Expected Results Summary

After running all tests, you should have verified:

1. ✅ **Export works** - Files download correctly
2. ✅ **Import works** - Workflows restored from files
3. ✅ **Validation works** - Invalid files rejected
4. ✅ **Persistence works** - Data survives page refresh
5. ✅ **Technical entities work** - Special workflow types supported
6. ✅ **Multiple workflows work** - Batch operations supported
7. ✅ **ZIP export works** - Alternative format available

## 🎯 Comparison with Vue Project

The React implementation provides **the same functionality** as the Vue project:

| Feature | Vue | React |
|---------|-----|-------|
| Export JSON | ✅ | ✅ |
| Export ZIP | ✅ | ✅ |
| Import JSON | ✅ | ✅ |
| Validation | ✅ | ✅ |
| Overwrite option | ✅ | ✅ |
| Multiple workflows | ✅ | ✅ |
| Technical entities | ✅ | ✅ |

**Key improvements in React version**:
- ✅ Better type safety (TypeScript)
- ✅ Comprehensive test coverage (40 tests)
- ✅ Simpler architecture (hooks vs factory pattern)
- ✅ Better error messages
- ✅ Single-step import (vs 2-step in Vue)

## 🚦 Test Status

Run through the checklist above and mark each item as you test it. If all items pass, the feature is working correctly! 🎉

