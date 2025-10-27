# Mock API for SAAS App

This directory contains mock API implementations for development when the backend is not available.

## Statemachine Mock API

The `statemachineMockApi.ts` provides mock responses for state machine endpoints.

### How to Enable

Open the browser console and run:

```javascript
enableStatemachineMock()
```

This will:
- Enable mock responses for all `/platform-api/statemachine/*` endpoints
- Save the setting to localStorage (persists across page reloads)
- Provide mock data for workflows, criteria, and processes

### How to Disable

```javascript
disableStatemachineMock()
```

### Reset Mock Data

To reset the mock data to defaults:

```javascript
resetStatemachineMockData()
```

### Features

**Supported Endpoints:**
- ✅ `GET /platform-api/statemachine/workflow-enabled-types` - Returns list of workflow-enabled entity classes
- ✅ `GET /platform-api/statemachine/workflows` - Returns list of workflows
- ✅ `GET /platform-api/statemachine/criteria` - Returns list of criteria
- ✅ `GET /platform-api/statemachine/processes` - Returns list of processes
- ✅ `POST /platform-api/statemachine/persisted/workflows` - Create new workflow
- ✅ `PUT /platform-api/statemachine/persisted/workflows/:id` - Update workflow
- ✅ `DELETE /platform-api/statemachine/persisted/workflows/:id` - Delete workflow

**Data Persistence:**
- All mock data is saved to localStorage
- Changes persist across page reloads
- Use `resetStatemachineMockData()` to reset to defaults

**Default Mock Data:**
- 2 sample workflows (Order Processing, User Onboarding)
- 3 workflow-enabled entity classes (User, Order, Product)
- Empty criteria and processes lists

### How It Works

The mock API uses Axios interceptors to:
1. Intercept requests to `/platform-api/statemachine/*` endpoints
2. When a 404 error occurs, check if the endpoint is supported
3. Return mock data instead of the error
4. Save any changes (POST/PUT/DELETE) to localStorage

This approach allows you to:
- Develop and test the UI without a backend
- Switch between mock and real API easily
- Persist mock data across sessions

### Example Usage

```javascript
// Enable mock API
enableStatemachineMock()

// Now you can create workflows in the UI
// The data will be saved to localStorage

// Check current mock data
console.log(localStorage.getItem('saas-app-statemachine-mock-data'))

// Reset to defaults
resetStatemachineMockData()

// Disable mock API (use real backend)
disableStatemachineMock()
```

### Development Tips

1. **First Time Setup:**
   - Open browser console
   - Run `enableStatemachineMock()`
   - Refresh the page
   - You should now see mock workflows

2. **Testing Workflow Creation:**
   - Make sure mock is enabled
   - Create a new workflow in the UI
   - It will be saved to localStorage
   - Refresh the page - your workflow should still be there

3. **Switching to Real Backend:**
   - Run `disableStatemachineMock()`
   - Refresh the page
   - Now it will use the real backend API

4. **Debugging:**
   - Check console for mock API logs (prefixed with 🧪, 🔄, 🎭, ✅)
   - All intercepted requests are logged
   - Mock responses are logged with status codes

