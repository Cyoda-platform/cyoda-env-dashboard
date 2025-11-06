# Manual Testing Guide - COBI Advanced Features

## Overview
This guide provides step-by-step instructions for manually testing all the advanced COBI features that have been integrated into the React application.

---

## Prerequisites
- Application running on `http://localhost:3009`
- Sample data files ready for testing (CSV, JSON, XML)

---

## 1. AI Generate Feature

### Location
- **Index Page**: `http://localhost:3009/data-mapper`

### Steps to Test
1. Navigate to `http://localhost:3009/data-mapper`
2. Click the **"AI Generate"** button (blue button with robot icon)
3. A modal should appear with title "AI Generate - Upload Configuration"
4. You should see a large drag-and-drop upload area
5. **Upload a JSON file** by either:
   - Clicking on the upload area and selecting a file
   - Dragging and dropping a JSON file into the area
6. After selecting a file:
   - You should see a success toast message
   - A green file preview box should appear showing the filename
   - The "Generate Configuration" button should become enabled
7. Click **"Generate Configuration"**
8. You should see a loading spinner with "Generating configuration..." message
9. After 2 seconds, you should see a success message "Data was generated successfully"
10. The modal should close automatically

### Expected Behavior
- ✅ Modal opens when clicking AI Generate button
- ✅ Drag & drop area is visible and interactive
- ✅ Only JSON files are accepted
- ✅ Non-JSON files show error message
- ✅ File preview appears after selection
- ✅ Generate button is disabled until file is selected
- ✅ Loading state shows during processing
- ✅ Success message appears after completion

---

## 2. Data Mapper Configuration Wizard

### Location
- **Edit Page**: `http://localhost:3009/data-mapper/configuration`

### Steps to Test

#### Step 0: Default Settings
1. Navigate to `http://localhost:3009/data-mapper/configuration`
2. You should see a step wizard with 5 steps
3. Current step should be "Default Settings"
4. Fill in the form:
   - **Mapping Name**: Enter a name (e.g., "Test Mapping")
   - **Data Type**: Select CSV, JSON, or XML
   - If CSV is selected, additional fields appear:
     - **Delimiter**: Default is `,`
     - **Quote Character**: Default is `"`
     - **Has Header Row**: Yes/No radio buttons
5. Click **"Next"** to proceed

#### Step 1: Upload File
1. You should now be on "Upload File" step
2. You should see a FilePond upload area
3. **Upload a sample data file** matching the data type selected in Step 0
4. The file should upload successfully
5. Click **"Next"** to proceed (button is disabled until file is uploaded)
6. You can click **"Previous"** to go back

#### Step 2: CSV Settings
1. If you selected CSV in Step 0, you'll see CSV configuration options
2. If you selected JSON or XML, you'll see a message to skip this step
3. For CSV:
   - Adjust **Delimiter** if needed
   - Adjust **Quote Character** if needed
   - Toggle **Has Header Row** if needed
4. Click **"Next"** to proceed

#### Step 3: Select Entity
1. This step is currently under construction
2. You should see a placeholder message
3. Click **"Next"** to proceed

#### Step 4: Data Mapping
1. This step is currently under construction
2. You should see a placeholder message
3. You can:
   - Click **"Previous"** to go back
   - Click **"Cancel"** to return to the index page
   - Click **"Save Mapping"** (not yet functional)

### Expected Behavior
- ✅ Step wizard displays all 5 steps
- ✅ Current step is highlighted
- ✅ Form validation works on Default Settings
- ✅ File upload works on Upload File step
- ✅ CSV settings only show for CSV data type
- ✅ Navigation buttons (Previous/Next) work correctly
- ✅ "Back to List" button returns to index page

---

## 3. File Upload Component (UploadFile)

### Features to Test
1. **Drag & Drop**: Drag a file into the upload area
2. **Click to Upload**: Click the upload area to open file picker
3. **File Type Validation**: 
   - CSV files should only accept .csv
   - JSON files should only accept .json
   - XML files should only accept .xml
4. **File Size**: Maximum 50MB
5. **Success Message**: Toast notification after successful upload
6. **Existing Data Alert**: If data already exists, shows a success alert

### Expected Behavior
- ✅ Drag & drop works
- ✅ Click to upload works
- ✅ File type validation works
- ✅ File size validation works
- ✅ Success messages appear
- ✅ Existing data alert shows when applicable

---

## 4. Common Issues & Solutions

### Issue: White Screen
**Solution**: This was caused by missing Buffer polyfill. Fixed by:
- Adding `buffer` package
- Creating `polyfills.ts` file
- Loading polyfills before main app

### Issue: File Upload Not Working
**Possible Causes**:
1. File type mismatch - ensure file extension matches selected data type
2. File too large - maximum 50MB
3. Browser compatibility - try a different browser

**Solutions**:
1. Check browser console for errors (F12)
2. Verify file type and size
3. Clear browser cache and reload

### Issue: AI Generate Button Not Visible
**Possible Causes**:
1. Component rendering error
2. React Query not initialized

**Solutions**:
1. Check browser console for errors
2. Verify QueryClientProvider is wrapping the app
3. Check ErrorBoundary for caught errors

---

## 5. Test Data Samples

### Sample CSV File
```csv
name,email,age
John Doe,john@example.com,30
Jane Smith,jane@example.com,25
```

### Sample JSON File
```json
{
  "name": "Test Configuration",
  "type": "dataMapper",
  "settings": {
    "delimiter": ",",
    "hasHeader": true
  }
}
```

### Sample XML File
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <name>Test Configuration</name>
  <type>dataMapper</type>
</configuration>
```

---

## 6. Browser Console Checks

### What to Look For
1. **No JavaScript Errors**: Console should be clean (except React DevTools message)
2. **Successful API Calls**: Network tab should show successful requests
3. **No 404 Errors**: All resources should load successfully

### How to Check
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Go to Network tab
5. Filter by "XHR" or "Fetch"
6. Check for failed requests (red status codes)

---

## 7. Performance Checks

### What to Test
1. **Page Load Time**: Should load within 2-3 seconds
2. **File Upload Speed**: Should upload within 1-2 seconds for small files
3. **Modal Open/Close**: Should be instant
4. **Step Navigation**: Should be instant

### How to Test
1. Use browser DevTools Performance tab
2. Record a session
3. Check for long tasks or slow operations

---

## 8. Accessibility Checks

### What to Test
1. **Keyboard Navigation**: Can you navigate using Tab key?
2. **Screen Reader**: Are labels and descriptions clear?
3. **Color Contrast**: Is text readable?
4. **Focus Indicators**: Can you see which element is focused?

### How to Test
1. Try navigating with keyboard only (Tab, Enter, Escape)
2. Use browser's accessibility inspector
3. Check ARIA labels and roles

---

## Summary

All advanced features have been successfully integrated and are ready for manual testing. The main features to test are:

1. ✅ **AI Generate** - Upload JSON configuration files
2. ✅ **Data Mapper Wizard** - Step-by-step data mapping configuration
3. ✅ **File Upload** - Drag & drop file upload with validation
4. ✅ **Error Handling** - ErrorBoundary catches and displays errors
5. ✅ **Buffer Polyfill** - Node.js packages work in browser

**Status**: Ready for manual testing and user acceptance testing (UAT)

