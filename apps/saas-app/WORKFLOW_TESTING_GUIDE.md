# Workflow Testing Guide - SaaS App with Mock Data

## 🚀 Quick Start

### Step 1: Start the App
```bash
cd react-project/apps/saas-app
npm run dev
```

The app will run on: **http://localhost:3000**

---

## 🧪 Enable Mock API for Testing

The SaaS app has a built-in mock API for testing workflows without a backend.

### Option 1: Enable via Browser Console

1. Open the app: http://localhost:3000
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Type and press Enter:
   ```javascript
   window.enableStatemachineMock()
   ```
5. You should see: `🧪 Statemachine Mock API enabled`
6. Refresh the page

### Option 2: Auto-Enable (Persists Across Sessions)

The mock API will auto-enable if it was previously enabled. Once you enable it once, it stays enabled until you disable it.

### Disable Mock API
```javascript
window.disableStatemachineMock()
```

### Reset Mock Data to Defaults
```javascript
window.resetStatemachineMockData()
```

---

## 📋 Test Workflow Creation

### Test 1: Navigate to Workflows

1. Open http://localhost:3000
2. Click **"Lifecycle"** in the left menu
3. Click **"Workflow"** submenu
4. You should see the Workflows list page

**Expected Result:**
- ✅ Table displays with 2 default workflows:
  - "Order Processing" (com.cyoda.tms.model.entities.Order)
  - "User Onboarding" (com.cyoda.tms.model.entities.User)

---

### Test 2: Create New Workflow

1. Click **"Create new workflow"** button (top right)
2. URL should change to `/workflow/new`
3. Form should display with empty fields

**Fill in the form:**

#### Required Fields:
- **Entity Class Name**: Select from dropdown
  - Options: `com.cyoda.tms.model.entities.User`, `com.cyoda.tms.model.entities.Order`, `com.cyoda.tms.model.entities.Product`
  - Example: Select `com.cyoda.tms.model.entities.Product`

- **Name**: Enter workflow name
  - Example: `Product Lifecycle`

#### Optional Fields:
- **Description**: Enter description
  - Example: `Workflow for managing product lifecycle from creation to retirement`

- **Documentation Link**: Enter valid URL (or leave empty)
  - Example: `https://docs.example.com/product-workflow`
  - ⚠️ Must be valid URL format (http:// or https://)

- **Criteria**: Select criteria (if any exist)
  - Can be left empty for now

- **Active**: Toggle on/off
  - Default: ON (checked)

- **Use Decision Tree**: Checkbox
  - Default: OFF (unchecked)

#### Click Save

**Expected Result:**
- ✅ Success message: "Workflow created successfully"
- ✅ Navigates to workflow detail page
- ✅ URL: `/workflow/workflow-[timestamp]?persistedType=persisted&entityClassName=com.cyoda.tms.model.entities.Product`
- ✅ Form fields populated with saved data

---

### Test 3: Verify Workflow in List

1. Click **"Back to Workflows"** button
2. Navigate back to Workflows list

**Expected Result:**
- ✅ New workflow appears in the table
- ✅ Shows correct Entity Class, Name, Active status
- ✅ Creation Date is today's date

---

### Test 4: Edit Workflow

1. Click on the workflow name or "Workflow" button
2. Workflow detail page loads
3. Change the name to: `Product Lifecycle - Updated`
4. Change description
5. Click **Save**

**Expected Result:**
- ✅ Success message: "Workflow updated successfully"
- ✅ Changes are saved
- ✅ Refresh page - changes persist

---

### Test 5: Delete Workflow

1. Go back to Workflows list
2. Find the workflow you created
3. Click **Delete** button (trash icon)
4. Confirmation modal appears
5. Click **Delete** in modal

**Expected Result:**
- ✅ Success message appears
- ✅ Workflow removed from table
- ✅ Refresh page - workflow is still gone (persisted in localStorage)

---

## 🔍 Debugging Tips

### Check Console Logs

When mock API is enabled, you'll see detailed logs:

```
🧪 Statemachine Mock API enabled
📦 Loaded statemachine mock data from localStorage
🔄 Mock intercepting: GET /platform-api/statemachine/workflow-enabled-types
🔄 Mock intercepting: GET /platform-api/statemachine/workflows
🔄 Mock intercepting: POST /platform-api/statemachine/persisted/workflows
✅ Created workflow: Product Lifecycle
💾 Saved statemachine mock data to localStorage
```

### Check Network Tab

1. Open DevTools → Network tab
2. Try to create a workflow
3. Look for requests to `/platform-api/statemachine/`
4. If mock is working, requests will return 200 status

### Check localStorage

View current mock data:
```javascript
// View all mock data
JSON.parse(localStorage.getItem('saas-app-statemachine-mock-data'))

// View just workflows
JSON.parse(localStorage.getItem('saas-app-statemachine-mock-data')).workflows
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Entity Class Dropdown is Empty

**Symptom:** Cannot select entity class, dropdown has no options

**Solution:**
1. Check console for errors
2. Make sure mock API is enabled: `window.enableStatemachineMock()`
3. Refresh the page
4. The mock API returns these entity classes:
   - `com.cyoda.tms.model.entities.User`
   - `com.cyoda.tms.model.entities.Order`
   - `com.cyoda.tms.model.entities.Product`

### Issue 2: "Failed to save workflow"

**Symptom:** Error message when clicking Save

**Possible Causes:**
1. **Validation error** - Check for red error messages under form fields
   - Entity Class is required
   - Name is required
   - Documentation Link must be valid URL

2. **Mock API not enabled** - Enable it:
   ```javascript
   window.enableStatemachineMock()
   ```

3. **JavaScript error** - Check browser console for errors

### Issue 3: Workflow Doesn't Appear After Save

**Symptom:** Success message shows but workflow not in list

**Solution:**
1. Refresh the page
2. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('saas-app-statemachine-mock-data')).workflows
   ```
3. If workflow is in localStorage but not showing, there might be a filtering issue

### Issue 4: Changes Don't Persist After Refresh

**Symptom:** Create workflow, refresh page, workflow is gone

**Solution:**
1. Check if mock API is enabled: `localStorage.getItem('saas-app-statemachine-mock-enabled')`
2. Should return `"true"`
3. If not, enable it and try again
4. Check browser console for localStorage errors

---

## 📊 Mock Data Structure

The mock API stores data in localStorage with this structure:

```javascript
{
  "workflows": [
    {
      "id": "workflow-001",
      "name": "Order Processing",
      "entityClassName": "com.cyoda.tms.model.entities.Order",
      "description": "Workflow for processing customer orders",
      "active": true,
      "persisted": true,
      "creationDate": 1234567890000
    }
  ],
  "criteria": [],
  "processes": []
}
```

---

## ✅ Complete Test Checklist

Use this checklist to verify all functionality:

- [ ] **App starts successfully** on http://localhost:3000
- [ ] **Enable mock API** via console
- [ ] **Navigate to Workflows** page
- [ ] **See default workflows** (Order Processing, User Onboarding)
- [ ] **Click "Create new workflow"** button
- [ ] **Entity Class dropdown** has options
- [ ] **Fill in all required fields** (Entity Class, Name)
- [ ] **Click Save** - success message appears
- [ ] **Navigate to workflow detail** page
- [ ] **Go back to list** - new workflow appears
- [ ] **Edit workflow** - changes save successfully
- [ ] **Delete workflow** - workflow removed
- [ ] **Refresh page** - changes persist

---

## 🎯 Expected Behavior Summary

### Mock API Enabled:
- ✅ All API calls intercepted
- ✅ Data stored in localStorage
- ✅ Changes persist across page refreshes
- ✅ Console shows detailed logs

### Mock API Disabled:
- ❌ API calls go to backend (http://localhost:8080)
- ❌ Will get 404 errors if backend not running
- ❌ No mock data available

---

## 🔧 Advanced Testing

### Test with Different Entity Types

Create workflows for each entity type:
1. User workflow
2. Order workflow  
3. Product workflow

### Test Validation

1. Try to save without Entity Class - should show error
2. Try to save without Name - should show error
3. Enter invalid URL in Documentation Link - should show error
4. Enter valid data - should save successfully

### Test Decision Tree

1. Check "Use Decision Tree" checkbox
2. Click "Decision Tree" tab
3. Tab should be enabled (not grayed out)
4. Uncheck checkbox
5. Tab should be disabled

---

## 📞 Need Help?

If you encounter issues:

1. **Check browser console** for errors
2. **Check Network tab** for failed requests
3. **Verify mock API is enabled**: `localStorage.getItem('saas-app-statemachine-mock-enabled')`
4. **Reset mock data**: `window.resetStatemachineMockData()`
5. **Clear all data and start fresh**:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

---

**Happy Testing! 🎉**

