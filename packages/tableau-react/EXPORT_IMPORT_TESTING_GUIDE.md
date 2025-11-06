# Export/Import Feature Testing Guide

## 🎯 Overview

This guide explains how to test the **Export/Import functionality** for Report Configurations in the Tableau React application.

---

## 📋 Prerequisites

### 1. Start the Mock API Server

The mock server provides test data and handles export/import requests.

```bash
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

**Expected Output:**
```
=========================================
  Mock API Server for Tableau Testing
=========================================

Server running at: http://localhost:8080

Available endpoints:
  ...
  GET  /platform-api/reporting/export-by-ids?includeIds={ids}
  POST /platform-api/reporting/import
  ...

Ready to accept requests! 🚀
```

### 2. Start the React Development Server

```bash
cd react-project/packages/tableau-react
npm run dev
```

**Expected Output:**
```
VITE v6.3.6  ready in 190 ms

➜  Local:   http://localhost:3007/
```

---

## 🧪 Testing the Export/Import Feature

### Method 1: Using the UI (Recommended)

#### **Step 1: Navigate to Reports Page**

Open your browser and go to:
```
http://localhost:3007/tableau/reports
```

#### **Step 2: View Available Reports**

You should see a table with 3 pre-loaded report definitions:
- **Customer Report** (RPT-001)
- **Transaction Report** (RPT-002)
- **Product Report** (RPT-003)

#### **Step 3: Export Reports**

1. **Select Reports:**
   - Click the checkboxes next to one or more reports
   - Example: Select "Customer Report" and "Transaction Report"

2. **Click Export Button:**
   - The Export button (blue, with upload icon) will be enabled
   - Click the "Export" button

3. **Download JSON File:**
   - A JSON file will be downloaded automatically
   - Filename format: `export_RPT-001-AND-RPT-002.json`

4. **Verify Export:**
   - Open the downloaded JSON file
   - You should see a structure like:
   ```json
   {
     "data": {
       "value": [
         {
           "id": "RPT-001",
           "name": "Customer Report",
           "description": "List of all customers",
           "type": "STANDARD",
           "entityClass": "com.cyoda.tms.model.entities.Customer",
           ...
         },
         ...
       ]
     }
   }
   ```

#### **Step 4: Import Reports**

1. **Modify the JSON (Optional):**
   - Open the exported JSON file in a text editor
   - Change the report names to test import:
   ```json
   {
     "data": {
       "value": [
         {
           "id": null,  // Set to null to create new reports
           "name": "Imported Customer Report",  // Changed name
           ...
         }
       ]
     }
   }
   ```

2. **Click Import Button:**
   - Click the "Import" button (gray, with download icon)
   - A file picker dialog will appear

3. **Select JSON File:**
   - Choose the exported (or modified) JSON file
   - Click "Open"

4. **Verify Import:**
   - You should see a success message: "Reports imported successfully"
   - The table will refresh automatically
   - New reports should appear in the list

#### **Step 5: Verify Results**

- Check that the imported reports appear in the table
- Verify the report names and descriptions
- Try exporting the newly imported reports

---

### Method 2: Using the Command Line

#### **Run the Test Script**

```bash
cd react-project/packages/tableau-react
./test-data/test-export-import.sh
```

**This script will:**
1. List existing report definitions
2. Export 2 reports (RPT-001 and RPT-002)
3. Modify the exported data (change names)
4. Import the modified reports
5. Verify the imported reports

**Expected Output:**
```
=========================================
  Testing Export/Import Functionality
=========================================

Step 1: Check available report definitions
...

Step 2: Export report definitions (RPT-001 and RPT-002)
✓ Exported data saved to /tmp/exported-reports.json

Step 3: Modify the exported data (change names)
...

Step 4: Import the modified report definitions
{
  "success": true,
  "imported": 2,
  "failed": 0,
  "message": "Successfully imported 2 report definition(s)"
}

✓ Import complete: 2 successful, 0 failed
```

---

## 📊 Test Data

### Pre-loaded Report Definitions

The mock server comes with 3 pre-loaded report definitions:

| ID | Name | Description | Entity Class |
|----|------|-------------|--------------|
| RPT-001 | Customer Report | List of all customers | com.cyoda.tms.model.entities.Customer |
| RPT-002 | Transaction Report | List of all transactions | com.cyoda.tms.model.entities.Transaction |
| RPT-003 | Product Report | List of all products | com.cyoda.tms.model.entities.Product |

### Sample Export File

A sample export file is available at:
```
/tmp/exported-reports.json
```

(Generated after running the test script)

---

## 🔍 API Endpoints

### Export Endpoint

```
GET /platform-api/reporting/export-by-ids?includeIds={id1},{id2},...
```

**Example:**
```bash
curl "http://localhost:8080/platform-api/reporting/export-by-ids?includeIds=RPT-001,RPT-002"
```

**Response:**
```json
{
  "data": {
    "value": [
      {
        "id": "RPT-001",
        "name": "Customer Report",
        ...
      },
      ...
    ]
  }
}
```

### Import Endpoint

```
POST /platform-api/reporting/import
Content-Type: application/json
```

**Example:**
```bash
curl -X POST "http://localhost:8080/platform-api/reporting/import" \
  -H "Content-Type: application/json" \
  -d @exported-reports.json
```

**Response:**
```json
{
  "success": true,
  "imported": 2,
  "failed": 0,
  "errors": [],
  "message": "Successfully imported 2 report definition(s)"
}
```

---

## ✅ Expected Behavior

### Export Feature

- ✅ Export button is **disabled** when no reports are selected
- ✅ Export button is **enabled** when one or more reports are selected
- ✅ Shows **loading spinner** during export
- ✅ Downloads JSON file with correct naming format
- ✅ Shows **success message** after export
- ✅ Shows **error message** if export fails

### Import Feature

- ✅ Import button is always **enabled**
- ✅ Only accepts **.json** files
- ✅ Shows **loading spinner** during import
- ✅ **Refreshes table** after successful import
- ✅ Shows **success message** with import count
- ✅ Shows **error message** if import fails
- ✅ Validates JSON structure before import

---

## 🐛 Troubleshooting

### Issue: Export button is disabled

**Solution:** Make sure you have selected at least one report by clicking the checkbox in the table.

### Issue: Import fails with "Invalid import data format"

**Solution:** Verify the JSON file structure matches the expected format:
```json
{
  "data": {
    "value": [
      { /* report definition */ }
    ]
  }
}
```

### Issue: Mock server not responding

**Solution:** 
1. Check if the mock server is running: `lsof -ti:8080`
2. Restart the mock server: `node test-data/mock-server.mjs`
3. Check the console for error messages

### Issue: Reports not appearing after import

**Solution:**
1. Check the browser console for errors
2. Verify the import response shows `"success": true`
3. Manually refresh the page
4. Check the mock server logs for import messages

---

## 📝 Notes

- **IDs:** When importing, you can set `"id": null` to create new reports with auto-generated IDs
- **Duplicates:** Importing with existing IDs will overwrite the existing reports
- **Validation:** The import validates the JSON structure before processing
- **Error Handling:** Failed imports show detailed error messages
- **Auto-refresh:** The table automatically refreshes after successful import

---

## 🎉 Success Criteria

The export/import feature is working correctly if:

1. ✅ You can select and export multiple reports
2. ✅ The exported JSON file contains all selected reports
3. ✅ You can import the exported JSON file
4. ✅ Imported reports appear in the table
5. ✅ Success/error messages are displayed appropriately
6. ✅ The table refreshes automatically after import

---

## 📚 Related Documentation

- [Mock Server Documentation](test-data/README.md)
- [Reports API Documentation](../../http-api-react/src/api/config.ts)
- [Report Configs Component](../src/pages/ReportConfigs.tsx)

---

**Happy Testing! 🚀**

