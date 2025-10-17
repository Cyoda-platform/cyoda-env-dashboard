# How to Create a Functional Mapping Line

Functional mappings allow you to transform data using functions and expressions before mapping it to the target field. Here's a step-by-step guide:

## Method 1: Drag and Drop (Recommended)

### Step 1: Start the Drag
1. **Hold Shift key** while clicking on a **source field circle** (left side)
2. OR **Hold Shift key** while clicking on a **target field circle** (right side)
3. The cursor will change to a crosshair and you'll see an orange line following your mouse

### Step 2: Complete the Connection
1. While still holding **Shift**, drag to the target field circle (right side)
2. Release the mouse on the target circle
3. A **functional mapping** (orange line) will be created

### Step 3: Configure the Functional Mapping
1. **Right-click** on the orange mapping line
2. Select **"Functional Mapping Settings"** from the context menu
3. The Functional Mapping Settings dialog will open

## Method 2: Click on Existing Functional Mapping

If a functional mapping already exists:
1. **Click** on the orange mapping line
2. The Functional Mapping Settings dialog will open automatically

## Functional Mapping Settings Dialog

The dialog allows you to configure:

### 1. **Name** (Optional)
- Give your mapping a descriptive name
- If left empty, it will be auto-generated

### 2. **Source Paths**
- Shows all source fields connected to this mapping
- You can add multiple source fields
- Click **"Add Source Path"** to add more
- Use the dropdown to select from available source fields

### 3. **Target Path** (Read-only)
- Shows the destination field
- Cannot be changed (determined by where you dropped the line)

### 4. **Statements** (Transformations)
- This is where you define the transformation logic
- Click **"Add Statement"** to add a new transformation
- Click **"Edit"** (code icon) to edit a statement in JSON format
- Click **"Delete"** (trash icon) to remove a statement

### 5. **Blockly Editor** (Advanced)
- For complex transformations, use the visual Blockly editor
- Drag and drop function blocks to build your transformation
- Available functions include:
  - **Concat** - Concatenate strings
  - **Transform Value** - Apply transformers
  - **String to Date** - Convert strings to dates
  - **Date to String** - Convert dates to strings
  - **As Map** - Create map objects
  - **Get Element by Index** - Access array elements
  - And many more...

## Visual Indicators

### Line Colors
- **Green** - Column mapping (direct field-to-field)
- **Orange** - Functional mapping (with transformations)
- **Blue** - Core metadata mapping
- **Red (dashed)** - Broken/non-existent relation

### Circle Colors
- **Gray** - No mapping
- **Green** - Has mapping
- **Blue** - Can be selected (during drag)
- **Red (pulsing)** - Active drag in progress

## Example: Simple Concatenation

Let's say you want to concatenate `firstName` and `lastName` into `fullName`:

1. **Hold Shift** + Click on `firstName` circle (source)
2. Drag to `fullName` circle (target) and release
3. Right-click the orange line → "Functional Mapping Settings"
4. Click **"Add Source Path"** and select `lastName`
5. Click **"Add Statement"**
6. Edit the statement to use a concat function:
```json
{
  "type": "RETURN",
  "expression": {
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
    "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Concat",
    "args": [
      {
        "type": "CONSTANT",
        "constantSource": "INPUT",
        "args": ["firstName"]
      },
      {
        "type": "CONSTANT",
        "constantSource": "LITERAL",
        "args": [" "]
      },
      {
        "type": "CONSTANT",
        "constantSource": "INPUT",
        "args": ["lastName"]
      }
    ]
  }
}
```
7. Click **"Save"**

## Tips

### Creating Functional Mappings
- ✅ **Always hold Shift** when dragging to create a functional mapping
- ✅ **Without Shift** = Column mapping (green line)
- ✅ **With Shift** = Functional mapping (orange line)

### Multiple Source Fields
- You can connect multiple source fields to one target field
- Each source field will be available in your transformation statements
- Drag from different source fields to the same target (while holding Shift)

### Editing Existing Mappings
- Click on the line to open settings
- Right-click for more options
- Delete by clicking the line and selecting "Delete"

### Common Functions
- **Concat** - Join strings
- **Transform Value** - Apply transformers (e.g., uppercase, lowercase)
- **String to Date** - Parse date strings
- **Date to String** - Format dates
- **As Map** - Create key-value maps
- **Get Element by Index** - Access array elements
- **Filter** - Filter arrays
- **Map** - Transform arrays

## Troubleshooting

### Line doesn't appear
- Make sure you're holding **Shift** key
- Check that both circles are visible and clickable
- Try zooming in if fields are too small

### Can't open settings dialog
- Make sure the line is orange (functional mapping)
- Try right-clicking directly on the line
- Check browser console for errors

### Transformation not working
- Validate your JSON syntax in statements
- Check that source field paths are correct
- Use the Blockly editor for visual validation
- Test with "Dry Run" feature

## Keyboard Shortcuts

- **Shift + Drag** - Create functional mapping
- **Drag (no Shift)** - Create column mapping
- **Right-click line** - Open context menu
- **Click line** - Open settings dialog
- **Esc** - Cancel active drag

## Next Steps

After creating your functional mapping:
1. **Test it** - Use the "Dry Run" button to test your mapping
2. **Review** - Check the "Search Paths" dialog to see all mappings
3. **Save** - Save your configuration
4. **Deploy** - Deploy to your environment

For more advanced transformations, explore the Blockly editor and available function blocks!

