# Mock API Toggle - Minimize Feature

## Feature Added

Added a minimize/expand button to the Test Mode window to allow users to collapse the detailed information while keeping the toggle accessible.

## Changes Made

**File**: `src/components/MockApiToggle.tsx`

### 1. Added State for Minimized View

```typescript
const [minimized, setMinimized] = useState(false);
```

### 2. Added Minimize Handler

```typescript
const handleMinimize = () => {
  setMinimized(!minimized);
};
```

### 3. Added Minimize Button to Card Header

```typescript
<Card
  size="small"
  style={{
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: minimized ? 200 : 350,  // Smaller width when minimized
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'width 0.3s ease',  // Smooth transition
  }}
  extra={
    <Button
      type="text"
      size="small"
      icon={minimized ? <ExpandOutlined /> : <MinusOutlined />}
      onClick={handleMinimize}
      style={{ padding: '4px 8px' }}
    />
  }
>
```

### 4. Conditional Content Display

```typescript
{!minimized && enabled && (
  <>
    <Alert ... />
    <Space wrap>
      <Tag color="green">Cluster Stats</Tag>
      ...
    </Space>
    <Text type="secondary">...</Text>
  </>
)}

{!minimized && !enabled && (
  <Text type="secondary">
    Enable test mode to use mock data...
  </Text>
)}
```

## UI Behavior

### Expanded State (Default)
- **Width**: 350px
- **Icon**: Minus icon (−)
- **Content**: Shows all details
  - Test Mode title
  - ON/OFF switch
  - Success alert with test node info
  - Tags for all mock endpoints
  - Navigation instructions

### Minimized State
- **Width**: 200px (shrinks smoothly)
- **Icon**: Expand icon (⤢)
- **Content**: Shows only essentials
  - Test Mode title
  - ON/OFF switch
  - No alert, tags, or instructions

## User Experience

### Benefits
1. **Less Screen Space**: When minimized, takes up less room on the screen
2. **Quick Access**: Toggle switch always visible for quick enable/disable
3. **Smooth Animation**: Width transition is smooth (0.3s ease)
4. **Clear Icons**: Minus icon to minimize, expand icon to restore
5. **Persistent State**: Minimized state is maintained during session

### Use Cases
- **Development**: Minimize when you need more screen space but want quick access to toggle
- **Testing**: Keep expanded to see all available mock endpoints
- **Demos**: Minimize to reduce visual clutter during presentations

## Visual States

### Expanded (350px wide)
```
┌─────────────────────────────────┐
│ 🧪 Test Mode        [−]         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✓ Mock API Enabled              │
│ All API calls will return mock  │
│ data for testing. Test node:    │
│ test-node-01                    │
│                                 │
│ [Cluster Stats] [Shards]        │
│ [Transactions] [Events]         │
│ [ZooKeeper] [Network]           │
│ [Caches] [Components]           │
│                                 │
│ Navigate to /processing-ui/     │
│ nodes/test-node-01 to test      │
└─────────────────────────────────┘
```

### Minimized (200px wide)
```
┌──────────────────┐
│ 🧪 Test Mode [⤢] │
│ ━━━━━━━━━━━━━━━━ │
└──────────────────┘
```

## Technical Details

### Icons Used
- **MinusOutlined**: Minimize button (when expanded)
- **ExpandOutlined**: Expand button (when minimized)
- **ExperimentOutlined**: Test mode icon
- **ApiOutlined**: Mock API alert icon

### Ant Design Components
- **Button**: Minimize/expand button with text type
- **Card**: Container with `extra` prop for header actions
- **Space**: Layout for content
- **Switch**: ON/OFF toggle
- **Alert**: Success message when enabled
- **Tag**: Mock endpoint indicators
- **Typography**: Text and Title components

### CSS Transitions
```css
transition: width 0.3s ease
```
- Smooth width change from 350px to 200px
- 0.3 second duration
- Ease timing function for natural feel

## Testing

To test the minimize feature:

1. **Open the application**: http://localhost:3008/processing-ui
2. **Locate the Test Mode window**: Bottom-right corner
3. **Click minimize button** (−): Window shrinks to 200px
4. **Click expand button** (⤢): Window expands back to 350px
5. **Toggle switch**: Works in both minimized and expanded states
6. **Enable test mode**: Details only show when expanded

## Accessibility

- ✅ **Keyboard accessible**: Button can be focused and activated with keyboard
- ✅ **Clear icons**: Visual indicators for minimize/expand actions
- ✅ **Smooth transitions**: Not jarring or disorienting
- ✅ **Functional in both states**: Toggle switch always accessible

## Future Enhancements

Potential improvements:
- [ ] Remember minimized state in localStorage
- [ ] Add tooltip to minimize/expand button
- [ ] Add keyboard shortcut (e.g., Ctrl+M)
- [ ] Add drag-and-drop to reposition the window
- [ ] Add close button to completely hide the window

## Related Files

- `src/components/MockApiToggle.tsx` - Main component (modified)
- `src/mocks/mockApi.ts` - Mock API implementation
- `src/mocks/testNodeData.ts` - Mock data
- `src/components/layout/Layout.tsx` - Layout that includes MockApiToggle

## Summary

The minimize feature provides a better user experience by:
- ✅ Reducing screen clutter when needed
- ✅ Keeping toggle switch always accessible
- ✅ Providing smooth, intuitive animations
- ✅ Maintaining all functionality in both states

**The Test Mode window is now more flexible and user-friendly!** 🎉

