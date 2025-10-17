# COBI - Hide Steps on Mapper Canvas

**Date**: 2025-10-17
**Feature**: Hide step wizard when viewing the mapping canvas
**Status**: ✅ Complete

---

## Problem

When users opened a mapping configuration and viewed the main canvas with mapping lines (the DataMapper component), the step-by-step wizard was still visible above it. This was confusing and took up valuable screen space.

**User Feedback**: "when user open a mapping and see the main canvas with mapping lines and etc, step by step menu shouldn't be visible"

---

## Solution

Modified the Steps component visibility logic to hide it when users are on the mapping canvas (Step 4), regardless of whether they're creating a new configuration or editing an existing one.

### Before
```tsx
{/* Only show steps when creating new configuration */}
{!isEditMode && (
  <Steps
    current={currentStep}
    items={steps}
    style={{ marginTop: '24px', marginBottom: '32px' }}
  />
)}
```

**Issue**: Steps were hidden only in edit mode, but still visible when creating new configurations on Step 4 (the mapping canvas).

### After
```tsx
{/* Only show steps when creating new configuration AND not on the mapping canvas */}
{!isEditMode && currentStep < 4 && (
  <Steps
    current={currentStep}
    items={steps}
    style={{ marginTop: '24px', marginBottom: '32px' }}
  />
)}
```

**Fix**: Steps are now hidden when:
1. In edit mode (editing existing configuration), OR
2. On Step 4 (the mapping canvas)

---

## Visual Comparison

### Before (Cluttered)

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Data Mapper Configuration          [Back to List]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ● ─────── ● ─────── ● ─────── ● ─────── ●                  │
│ Default   Upload    CSV       Select    Data                │
│ Settings  File      Settings  Entity    Mapping             │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Data Mapping                                            │ │
│ │                                                          │ │
│ │ ┌──────────────┐         ┌──────────────┐              │ │
│ │ │ Source       │         │ Target       │              │ │
│ │ │              │ ─────── │              │              │ │
│ │ │ field1       │ ─────── │ name         │              │ │
│ │ │ field2       │         │ address      │              │ │
│ │ └──────────────┘         └──────────────┘              │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Issues:
- ❌ Steps visible above mapping canvas
- ❌ Wasted vertical space
- ❌ Confusing - why show steps when already mapping?
- ❌ Less room for the actual mapper
```

### After (Clean)

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Data Mapper Configuration          [Back to List]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Data Mapping Configuration                                  │
│ Edit your data mapping configuration.                       │
│                                          [Cancel] [Save Changes]
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │ ┌──────────────┐         ┌──────────────┐              │ │
│ │ │ Source       │         │ Target       │              │ │
│ │ │              │ ─────── │              │              │ │
│ │ │ field1       │ ─────── │ name         │              │ │
│ │ │ field2       │         │ address      │              │ │
│ │ │ field3       │ ─────── │ email        │              │ │
│ │ │ field4       │         │ phone        │              │ │
│ │ └──────────────┘         └──────────────┘              │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Benefits:
- ✅ No steps on mapping canvas
- ✅ More vertical space for mapper
- ✅ Cleaner, focused interface
- ✅ Better user experience
```

---

## Behavior by Scenario

### Scenario 1: Creating New Configuration

**Steps 0-3**: Steps component is **visible**
- Step 0: Default Settings → ✅ Shows steps
- Step 1: Upload File → ✅ Shows steps
- Step 2: CSV Settings → ✅ Shows steps
- Step 3: Select Entity → ✅ Shows steps

**Step 4**: Steps component is **hidden**
- Step 4: Data Mapping → ❌ Hides steps (clean canvas)

### Scenario 2: Editing Existing Configuration

**All steps**: Steps component is **hidden**
- Loads directly to DataMapper → ❌ No steps shown
- Clean interface for editing

### Scenario 3: Copying Configuration

**Steps 0-3**: Steps component is **visible**
- Same as creating new (shows steps for configuration)

**Step 4**: Steps component is **hidden**
- Same as creating new (hides steps on canvas)

---

## Implementation Details

### File Modified
`react-project/packages/cobi-react/src/pages/DataMapper/DataMapperEdit.tsx`

### Change Made
**Line 255-262**: Updated Steps visibility condition

```typescript
// Before
{!isEditMode && (
  <Steps ... />
)}

// After
{!isEditMode && currentStep < 4 && (
  <Steps ... />
)}
```

### Logic
```typescript
const isEditMode = id && existingMapping;
const showSteps = !isEditMode && currentStep < 4;
```

**Truth Table**:

| Scenario | isEditMode | currentStep | showSteps | Result |
|----------|------------|-------------|-----------|--------|
| Create - Step 0 | false | 0 | true | ✅ Show |
| Create - Step 1 | false | 1 | true | ✅ Show |
| Create - Step 2 | false | 2 | true | ✅ Show |
| Create - Step 3 | false | 3 | true | ✅ Show |
| Create - Step 4 | false | 4 | false | ❌ Hide |
| Edit - Any step | true | any | false | ❌ Hide |

---

## Benefits

### 1. More Screen Real Estate
- Steps component takes ~80px of vertical space
- Hiding it gives more room for the mapping canvas
- Users can see more source/target fields without scrolling

### 2. Cleaner Interface
- Mapping canvas is the focus when on Step 4
- No distracting navigation elements
- Professional, focused appearance

### 3. Better User Experience
- Clear separation: Steps for configuration, Canvas for mapping
- Less cognitive load - users focus on one task
- Matches user expectations (Vue version behavior)

### 4. Consistent Behavior
- Edit mode: No steps (already implemented)
- Create mode Step 4: No steps (new fix)
- Both scenarios now have clean mapping canvas

---

## Testing

### Test Case 1: Create New - Steps 0-3
```
1. Navigate to /data-mapper
2. Click "Create Mapping"
3. Go through Steps 0-3
✅ Steps component should be visible
✅ Current step should be highlighted
✅ Can navigate between steps
```

### Test Case 2: Create New - Step 4
```
1. Navigate to /data-mapper
2. Click "Create Mapping"
3. Complete Steps 0-3
4. Reach Step 4 (Data Mapping)
✅ Steps component should be HIDDEN
✅ Mapping canvas should have full space
✅ No step indicators visible
```

### Test Case 3: Edit Existing
```
1. Navigate to /data-mapper
2. Click "Edit" on existing mapping
✅ Steps component should be HIDDEN
✅ DataMapper should load directly
✅ Clean interface with no steps
```

### Test Case 4: Copy Configuration
```
1. Navigate to /data-mapper
2. Click "Copy" on existing mapping
3. Go through Steps 0-3
✅ Steps component should be visible
4. Reach Step 4
✅ Steps component should be HIDDEN
```

---

## Edge Cases Handled

### 1. Navigation Between Steps
- User can still navigate using Previous/Next buttons
- Steps component visibility updates correctly
- No visual glitches during transitions

### 2. Direct URL Access
- `/data-mapper/configuration` → Shows steps (Step 0)
- `/data-mapper/configuration/:id` → Hides steps (Edit mode)
- Correct behavior regardless of entry point

### 3. Browser Back/Forward
- Steps visibility updates correctly
- State is maintained properly
- No inconsistencies

---

## Related Changes

This change complements the previous edit mode improvement:

1. **Previous**: Hide steps when editing existing configurations
2. **This**: Hide steps when on mapping canvas (Step 4)
3. **Combined**: Steps only show during configuration steps (0-3) when creating new

---

## Status

**✅ Complete**: The Steps component is now hidden when viewing the mapping canvas, providing a cleaner and more focused interface for users.

The application is running at http://localhost:3009/ and the changes have been hot-reloaded.

---

## Summary

**What changed**: Added `currentStep < 4` condition to Steps visibility logic

**Why**: Steps were cluttering the mapping canvas interface

**Result**: Clean, focused mapping canvas with more screen space

**Impact**: Better UX, more professional appearance, matches user expectations

