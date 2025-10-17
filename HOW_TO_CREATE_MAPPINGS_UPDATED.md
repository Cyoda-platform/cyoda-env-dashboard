# How to Create Mapping Lines - Complete Guide

## Overview

There are now **TWO WAYS** to create mapping lines in the DataMapper:

1. **Click and Choose** (Recommended) - Click on circle, choose type from menu
2. **Keyboard Modifier** - Hold Shift for functional mapping

---

## Method 1: Click and Choose (NEW - Recommended)

### Step-by-Step:

#### 1. Click on Source Field Circle
- Find the field you want to map on the **left side** (Source Data)
- **Click** on the small circle next to the field value
- A popup menu will appear with two options

#### 2. Choose Mapping Type
The popup shows:
- **Column Mapping** - Direct field-to-field copy (no transformation)
- **Functional Mapping** - Apply transformations, functions, or combine multiple fields

#### 3. Drag to Target
- After clicking your choice, a colored line will appear
- **Drag** the line to the target field circle on the **right side**
- The line color indicates the mapping type:
  - **Green** = Column Mapping
  - **Orange** = Functional Mapping

#### 4. Drop to Create
- **Release** the mouse on the target circle
- The mapping is created!
- For functional mappings, you can now configure transformations

---

## Method 2: Keyboard Modifier (Advanced)

### For Column Mapping (Green Line):
1. **Click and drag** from source circle to target circle
2. **No keyboard keys needed**
3. Release to create a direct column mapping

### For Functional Mapping (Orange Line):
1. **Hold Shift key**
2. **Click and drag** from source circle to target circle
3. **Keep holding Shift** until you release
4. Release to create a functional mapping

---

## Mapping Types Explained

### Column Mapping (Green Line)
- **Purpose**: Direct field-to-field copy
- **Use When**: 
  - Source and target have the same data type
  - No transformation needed
  - Simple 1-to-1 mapping
- **Example**: Copy `firstName` → `firstName`

### Functional Mapping (Orange Line)
- **Purpose**: Transform data before mapping
- **Use When**:
  - Need to combine multiple fields
  - Need to apply transformations (uppercase, date format, etc.)
  - Need to use functions (concat, split, etc.)
  - Multiple sources to one target
- **Example**: Combine `firstName` + `lastName` → `fullName`

### Core Metadata (Blue Line)
- **Purpose**: System metadata fields
- **Use When**: Mapping system-level information
- **Example**: Entity ID, timestamps, version info

---

## Visual Guide

```
SOURCE DATA (Left)          TARGET ENTITY (Right)
┌─────────────────┐         ┌─────────────────┐
│ firstName ●─────┼────────→│ ● firstName     │  Green = Column Mapping
│ lastName  ●─────┼───┐     │                 │
│           ●─────┼───┴────→│ ● fullName      │  Orange = Functional Mapping
│ email     ●─────┼────────→│ ● email         │  Green = Column Mapping
└─────────────────┘         └─────────────────┘
```

---

## Configuring Functional Mappings

After creating a functional mapping (orange line):

### 1. Right-Click the Orange Line
- A context menu appears
- Select **"Functional Mapping Settings"**

### 2. Configure in the Dialog
The Functional Mapping Settings dialog allows you to:

#### Source Paths
- View all source fields connected to this mapping
- Add more source fields by clicking **"Add Source Path"**
- Remove source fields

#### Target Path
- Shows the destination field (read-only)

#### Statements (Transformations)
- Click **"Add Statement"** to add transformation logic
- Click **"Edit"** to modify a statement
- Click **"Delete"** to remove a statement

#### Available Functions
- **Concat** - Join strings together
- **Transform Value** - Apply transformers (uppercase, lowercase, trim, etc.)
- **String to Date** - Parse date strings
- **Date to String** - Format dates
- **As Map** - Create key-value maps
- **Get Element by Index** - Access array elements
- **Filter** - Filter arrays
- **Map** - Transform arrays
- And many more...

### 3. Use Blockly Editor (Optional)
- For complex transformations, click **"Open Blockly Editor"**
- Drag and drop function blocks visually
- Build transformation logic without writing code

### 4. Save
- Click **"Save"** to apply your configuration
- The mapping is now active with your transformations

---

## Examples

### Example 1: Simple Column Mapping
**Goal**: Copy email field directly

1. Click on `email` circle (source)
2. Choose **"Column Mapping"**
3. Drag to `email` circle (target)
4. Release - Done! ✓

### Example 2: Concatenate Names
**Goal**: Combine firstName and lastName into fullName

1. Click on `firstName` circle (source)
2. Choose **"Functional Mapping"**
3. Drag to `fullName` circle (target)
4. Release
5. Right-click the orange line → "Functional Mapping Settings"
6. Click **"Add Source Path"** → Select `lastName`
7. Click **"Add Statement"**
8. Configure concat function:
```json
{
  "type": "RETURN",
  "expression": {
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
    "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Concat",
    "args": [
      { "type": "CONSTANT", "constantSource": "INPUT", "args": ["firstName"] },
      { "type": "CONSTANT", "constantSource": "LITERAL", "args": [" "] },
      { "type": "CONSTANT", "constantSource": "INPUT", "args": ["lastName"] }
    ]
  }
}
```
9. Click **"Save"** - Done! ✓

### Example 3: Date Formatting
**Goal**: Convert date string to specific format

1. Click on `birthDate` circle (source)
2. Choose **"Functional Mapping"**
3. Drag to `formattedBirthDate` circle (target)
4. Release
5. Right-click the orange line → "Functional Mapping Settings"
6. Use **"String to Date"** function
7. Configure date format
8. Click **"Save"** - Done! ✓

---

## Tips and Tricks

### ✅ DO:
- Use **Column Mapping** for simple field copies (faster, simpler)
- Use **Functional Mapping** when you need transformations
- Test your mappings with **"Dry Run"** before deploying
- Use the **Blockly Editor** for complex transformations
- Check the **"Search Paths"** dialog to see all your mappings

### ❌ DON'T:
- Don't use functional mapping when column mapping is sufficient
- Don't forget to save your functional mapping configuration
- Don't map incompatible data types without transformation
- Don't create circular dependencies

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Create Column Mapping | Click + Drag |
| Create Functional Mapping | Shift + Click + Drag |
| Cancel Active Drag | Esc |
| Open Settings | Right-click line |
| Delete Mapping | Click line → Delete |

---

## Troubleshooting

### Line doesn't appear when dragging
- Make sure you clicked on the circle (not the field name)
- Check that both source and target circles are visible
- Try zooming in if fields are too small

### Can't choose mapping type
- Make sure you're clicking on a **leaf node** (field with a value)
- Parent nodes (objects/arrays) don't show the popup
- Check that the circle is visible and clickable

### Functional mapping not working
- Open the settings dialog and verify your configuration
- Check that all source paths are correct
- Validate your transformation statements
- Use "Dry Run" to test the mapping

### Popover doesn't close
- Click outside the popover to close it
- Or select one of the options (it will close automatically)

---

## Color Reference

| Color | Type | Description |
|-------|------|-------------|
| 🟢 Green | Column Mapping | Direct field-to-field copy |
| 🟠 Orange | Functional Mapping | With transformations |
| 🔵 Blue | Core Metadata | System metadata |
| 🔴 Red (dashed) | Broken Relation | Invalid or non-existent |

---

## Next Steps

1. **Create your first mapping** using the click-and-choose method
2. **Experiment** with both column and functional mappings
3. **Configure transformations** in the Functional Mapping Settings dialog
4. **Test** your mappings with the Dry Run feature
5. **Save** your configuration
6. **Deploy** to your environment

For more advanced features, see:
- Functional Mapping Settings documentation
- Blockly Editor guide
- Transformation functions reference

Happy mapping! 🎯

