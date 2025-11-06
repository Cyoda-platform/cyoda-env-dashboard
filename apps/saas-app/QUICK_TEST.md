# Quick Workflow Test - 5 Minutes ⚡

## 🚀 App is Running!

**URL:** http://localhost:3000

---

## ✅ Mock API is NOW ENABLED BY DEFAULT!

The mock API has been updated to intercept ALL statemachine requests automatically when enabled.

## Step 1: Enable Mock API (30 seconds)

1. Open http://localhost:3000
2. Press **F12** (open DevTools)
3. Go to **Console** tab
4. Type and press Enter:
   ```javascript
   window.enableStatemachineMock()
   ```
5. You should see: `🧪 Statemachine Mock API enabled`
6. **Refresh the page** (F5)

**Note:** You'll see proxy errors in the Vite console - this is NORMAL and EXPECTED! The mock API intercepts these errors and returns mock data.

---

## Step 2: Navigate to Workflows (30 seconds)

1. Click **"Lifecycle"** in left menu
2. Click **"Workflow"** submenu
3. You should see 2 workflows:
   - Order Processing
   - User Onboarding

---

## Step 3: Create New Workflow (2 minutes)

1. Click **"Create new workflow"** button (top right)

2. **Fill in the form:**
   - **Entity Class**: Select `com.cyoda.tms.model.entities.Product`
   - **Name**: `Product Lifecycle Test`
   - **Description**: `Testing workflow creation`
   - **Documentation Link**: Leave empty OR `https://example.com`
   - **Active**: Leave checked ✅

3. Click **Save** button

4. **Expected:**
   - ✅ Success message: "Workflow created successfully"
   - ✅ Navigates to workflow detail page
   - ✅ Form shows your data

---

## Step 4: Verify in List (1 minute)

1. Click **"Back to Workflows"** button
2. You should see 3 workflows now (including your new one)
3. Find "Product Lifecycle Test" in the table

---

## Step 5: Edit & Delete (1 minute)

### Edit:
1. Click on "Product Lifecycle Test" workflow
2. Change name to: `Product Lifecycle - UPDATED`
3. Click **Save**
4. ✅ Success message appears

### Delete:
1. Go back to Workflows list
2. Click **Delete** button (trash icon) on your workflow
3. Click **Delete** in confirmation modal
4. ✅ Workflow removed from table

---

## ✅ Success Criteria

If all steps worked:
- ✅ Mock API is working
- ✅ Workflow creation works
- ✅ Workflow editing works
- ✅ Workflow deletion works
- ✅ Data persists in localStorage

---

## 🐛 If Something Doesn't Work

### Entity Class dropdown is empty?
```javascript
// In console:
window.enableStatemachineMock()
location.reload()
```

### "Failed to save workflow" error?
- Check that Entity Class is selected
- Check that Name is filled in
- Check console for errors (F12 → Console)

### Workflow doesn't appear after save?
- Refresh the page (F5)
- Check console logs for errors

### Reset everything and start over:
```javascript
// In console:
localStorage.clear()
location.reload()
window.enableStatemachineMock()
```

---

## 🔍 Console Commands Reference

```javascript
// Enable mock API
window.enableStatemachineMock()

// Disable mock API
window.disableStatemachineMock()

// Reset to default workflows
window.resetStatemachineMockData()

// View current workflows
JSON.parse(localStorage.getItem('saas-app-statemachine-mock-data')).workflows

// Clear everything
localStorage.clear()
```

---

## 📊 What You Should See in Console

When mock API is working, you'll see logs like:

```
🧪 Statemachine Mock API enabled
📦 Loaded statemachine mock data from localStorage
🔄 Mock intercepting: GET /platform-api/statemachine/workflow-enabled-types
🔄 Mock intercepting: GET /platform-api/statemachine/workflows
🔄 Mock intercepting: POST /platform-api/statemachine/persisted/workflows
✅ Created workflow: Product Lifecycle Test
💾 Saved statemachine mock data to localStorage
```

---

## 🎯 Test Data Available

### Entity Classes (for dropdown):
- `com.cyoda.tms.model.entities.User`
- `com.cyoda.tms.model.entities.Order`
- `com.cyoda.tms.model.entities.Product`

### Default Workflows:
1. **Order Processing**
   - Entity: `com.cyoda.tms.model.entities.Order`
   - Active: Yes
   - Persisted: Yes

2. **User Onboarding**
   - Entity: `com.cyoda.tms.model.entities.User`
   - Active: Yes
   - Persisted: Yes

---

**Ready to test! 🚀**

For detailed testing guide, see: [WORKFLOW_TESTING_GUIDE.md](./WORKFLOW_TESTING_GUIDE.md)

