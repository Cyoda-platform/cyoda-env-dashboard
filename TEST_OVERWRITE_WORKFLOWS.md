# Test Guide: "Overwrite Existing Workflows" Feature

## 🎯 What We're Testing

The **"Overwrite existing workflows"** checkbox controls whether the import operation will:
- ✅ **Checked (needRewrite=true)**: Replace existing workflows with the same ID
- ⏭️ **Unchecked (needRewrite=false)**: Skip existing workflows, only add new ones

## 🚀 Prerequisites

1. **App running**: http://localhost:3014
2. **Browser console open**: Press F12 (to see detailed logs)
3. **Workflows page**: Navigate to the Workflows page

## 📋 Test Scenario 1: Overwrite Enabled (Default)

### Step 1: Export a Workflow
1. Select "Order Processing" workflow
2. Click **Export** button
3. Select **JSON** format
4. Click **Export**
5. ✅ File `export_workflows.json` downloads

### Step 2: Modify the Workflow
1. Click on "Order Processing" workflow to edit it
2. Change the **description** to: `MODIFIED - Test overwrite feature`
3. Save the changes
4. ✅ Verify the description changed in the table

### Step 3: Import with Overwrite Enabled
1. Click **Import** button
2. Upload the exported JSON file (from Step 1)
3. ✅ Verify checkbox shows: **"Overwrite existing workflows"** is **CHECKED** (default)
4. ✅ Verify preview shows: "Found 1 workflow: Order Processing"
5. Click **Import** button

### Step 4: Verify Overwrite Happened
1. ✅ Check the workflow description - it should be **REVERTED** to the original (from the file)
2. ✅ Open browser console and look for:
   ```
   📥 Import request received
      needRewrite: true
      ✅ Overwritten workflow: Order Processing (workflow-001)
   ```
3. ✅ Success message appears
4. ✅ Workflow data matches the exported file (original description restored)

### Expected Console Output:
```
📥 Import request received
   URL: /platform-api/statemachine/import?needRewrite=true
   needRewrite: true
   Data structure: {
     hasWorkflow: true,
     hasState: true,
     hasTransition: true
   }
   ✅ Overwritten workflow: Order Processing (workflow-001)
   ✅ Import completed successfully
```

---

## 📋 Test Scenario 2: Overwrite Disabled

### Step 1: Export Current State
1. Make sure "Order Processing" has description: `CURRENT VERSION`
2. Edit the workflow and set description to: `CURRENT VERSION`
3. Save changes
4. Export "Order Processing" as JSON → Save as `current_version.json`

### Step 2: Modify the Workflow Again
1. Edit "Order Processing" workflow
2. Change description to: `NEWER VERSION - Should NOT be overwritten`
3. Save changes
4. ✅ Verify description shows: `NEWER VERSION - Should NOT be overwritten`

### Step 3: Import with Overwrite Disabled
1. Click **Import** button
2. Upload `current_version.json` (from Step 1)
3. ✅ **UNCHECK** the checkbox: "Overwrite existing workflows"
4. ✅ Verify preview shows: "Found 1 workflow: Order Processing"
5. Click **Import** button

### Step 4: Verify Workflow Was NOT Overwritten
1. ✅ Check the workflow description - it should STILL be: `NEWER VERSION - Should NOT be overwritten`
2. ✅ Open browser console and look for:
   ```
   📥 Import request received
      needRewrite: false
      ⏭️  Skipped existing workflow: Order Processing (workflow-001)
   ```
3. ✅ Success message appears (import succeeded but skipped the workflow)
4. ✅ Workflow data remains unchanged

### Expected Console Output:
```
📥 Import request received
   URL: /platform-api/statemachine/import?needRewrite=false
   needRewrite: false
   Data structure: {
     hasWorkflow: true,
     hasState: true,
     hasTransition: true
   }
   ⏭️  Skipped existing workflow: Order Processing (workflow-001)
   ✅ Import completed successfully
```

---

## 📋 Test Scenario 3: Mixed Import (New + Existing)

### Step 1: Prepare Test Data
1. Export "Order Processing" and "User Registration" workflows
2. Save as `two_workflows.json`
3. Delete "User Registration" workflow from the table
4. Modify "Order Processing" description to: `MODIFIED - Should not change`

### Step 2: Import with Overwrite Disabled
1. Click **Import**
2. Upload `two_workflows.json`
3. ✅ **UNCHECK** "Overwrite existing workflows"
4. ✅ Verify preview shows: "Found 2 workflows"
5. Click **Import**

### Step 3: Verify Results
1. ✅ "Order Processing" should STILL have description: `MODIFIED - Should not change` (skipped)
2. ✅ "User Registration" should be RESTORED (new workflow added)
3. ✅ Console should show:
   ```
   ⏭️  Skipped existing workflow: Order Processing (workflow-001)
   ✅ Added new workflow: User Registration (workflow-002)
   ```

### Step 4: Import with Overwrite Enabled
1. Modify "Order Processing" description again to: `WILL BE OVERWRITTEN`
2. Click **Import**
3. Upload `two_workflows.json` again
4. ✅ **CHECK** "Overwrite existing workflows"
5. Click **Import**

### Step 5: Verify Overwrite
1. ✅ "Order Processing" should be REVERTED to original description (from file)
2. ✅ "User Registration" remains unchanged (already exists)
3. ✅ Console should show:
   ```
   ✅ Overwritten workflow: Order Processing (workflow-001)
   ✅ Overwritten workflow: User Registration (workflow-002)
   ```

---

## 📋 Test Scenario 4: Technical Entity Workflow

### Step 1: Test with Technical Entity
1. Export "Data Pipeline Processing" workflow (technical entity)
2. Modify its description to: `TECHNICAL - MODIFIED`
3. Import with **Overwrite ENABLED**
4. ✅ Verify description reverts to original
5. ✅ Verify all states, transitions, criteria, processes are restored

### Step 2: Test Skip Technical Entity
1. Modify "Data Pipeline Processing" description to: `TECHNICAL - KEEP THIS`
2. Import the exported file with **Overwrite DISABLED**
3. ✅ Verify description remains: `TECHNICAL - KEEP THIS`
4. ✅ Console shows: `⏭️  Skipped existing workflow: Data Pipeline Processing`

---

## 🔍 What to Check in Browser Console

The mock API logs detailed information. Look for these patterns:

### When Overwrite is ENABLED (needRewrite=true):
```
📥 Import request received
   URL: /platform-api/statemachine/import?needRewrite=true
   needRewrite: true
   ✅ Overwritten workflow: Order Processing (workflow-001)
   ✅ Overwritten 5 states
   ✅ Overwritten 8 transitions
```

### When Overwrite is DISABLED (needRewrite=false):
```
📥 Import request received
   URL: /platform-api/statemachine/import?needRewrite=false
   needRewrite: false
   ⏭️  Skipped existing workflow: Order Processing (workflow-001)
   ✅ Added 0 new workflows
   ⏭️  Skipped 1 existing workflows
```

---

## ✅ Success Criteria

After completing all test scenarios, verify:

1. ✅ **Checkbox works correctly**
   - Default state is CHECKED (overwrite enabled)
   - Can be toggled on/off
   - Label and description are clear

2. ✅ **Overwrite enabled (needRewrite=true)**
   - Existing workflows are replaced with imported data
   - All related data (states, transitions, etc.) are updated
   - Console shows "Overwritten workflow" messages

3. ✅ **Overwrite disabled (needRewrite=false)**
   - Existing workflows are NOT modified
   - Only new workflows are added
   - Console shows "Skipped existing workflow" messages

4. ✅ **Mixed scenarios work**
   - Can import files with both new and existing workflows
   - Behavior is consistent for each workflow based on needRewrite flag

5. ✅ **Technical entities work**
   - Technical workflow types respect the overwrite setting
   - All related data handled correctly

6. ✅ **Persistence works**
   - Changes persist after page refresh
   - localStorage is updated correctly

---

## 🐛 Common Issues to Watch For

### Issue: Checkbox state not respected
**Check**: Look at the URL in console - should show `needRewrite=true` or `needRewrite=false`

### Issue: Workflow always overwrites
**Check**: Make sure checkbox is actually unchecked before clicking Import

### Issue: Changes don't persist
**Check**: Browser console for localStorage save messages

### Issue: Console shows wrong needRewrite value
**Check**: The checkbox state before clicking Import button

---

## 🎯 Comparison with Vue Project

The Vue project had a similar feature called **"Fail On Exists"** which was the **inverse**:
- Vue: "Fail On Exists" = true → Skip existing (don't overwrite)
- React: "Overwrite existing" = true → Replace existing (do overwrite)

The React implementation is **more intuitive** because:
- ✅ Positive framing ("Overwrite" vs "Fail")
- ✅ Default behavior is clear (checked = overwrite)
- ✅ Better description text

Both implementations use the same API parameter: `needRewrite`

---

## 📊 Test Results Template

Use this checklist to track your testing:

- [ ] **Scenario 1**: Overwrite enabled - workflow replaced ✅
- [ ] **Scenario 2**: Overwrite disabled - workflow skipped ✅
- [ ] **Scenario 3**: Mixed import - correct behavior for each ✅
- [ ] **Scenario 4**: Technical entity - works correctly ✅
- [ ] **Console logs**: Show correct needRewrite value ✅
- [ ] **Persistence**: Changes survive page refresh ✅
- [ ] **UI**: Checkbox works and is clear ✅

---

## 🚀 Quick Test (5 minutes)

If you want a quick test:

1. Export "Order Processing" workflow
2. Change its description to "MODIFIED"
3. Import with checkbox **CHECKED** → Description reverts ✅
4. Change description to "MODIFIED AGAIN"
5. Import with checkbox **UNCHECKED** → Description stays "MODIFIED AGAIN" ✅

**If both tests pass, the feature works correctly!** 🎉

