# Graphical View Fix - State Machine Diagram

## Problem

The graphical view was showing controls and legend but no actual state machine diagram. The canvas area was completely blank.

## Root Cause

The mock transitions data structure was incompatible with the GraphicalStateMachine component requirements.

### What Was Wrong

**Mock Data Had:**
```typescript
const mockTransitions = [
  { 
    id: 'trans-001', 
    name: 'Start Processing', 
    fromState: 'CREATED',      // ❌ Wrong field name
    toState: 'PROCESSING',     // ❌ Wrong field name
    workflowId: 'workflow-001' 
  },
  // ...
];
```

**GraphicalStateMachine Expected:**
```typescript
interface Transition {
  id: string;
  name: string;
  startStateId: string;        // ✅ Required
  endStateId: string;          // ✅ Required
  startStateName: string;      // ✅ Required
  endStateName: string;        // ✅ Required
  automated: boolean;          // ✅ Required
  persisted: boolean;          // ✅ Required
  workflowId: string;
  criteriaIds: string[];       // ✅ Required for criteria nodes
  endProcessesIds: string[];   // ✅ Required for process nodes
}
```

## Solution

Updated the mock transitions data to include all required fields:

```typescript
const mockTransitions = [
  { 
    id: 'trans-001', 
    name: 'Start Processing', 
    startStateId: 'state-001',        // ✅ Maps to state ID
    endStateId: 'state-002',          // ✅ Maps to state ID
    startStateName: 'CREATED',        // ✅ Display name
    endStateName: 'PROCESSING',       // ✅ Display name
    automated: true,                  // ✅ Determines arrow style
    persisted: true,                  // ✅ Determines if editable
    workflowId: 'workflow-001',
    criteriaIds: ['criteria-001'],    // ✅ Links to criteria
    endProcessesIds: ['process-001'], // ✅ Links to processes
  },
  { 
    id: 'trans-002', 
    name: 'Ship Order', 
    startStateId: 'state-002',
    endStateId: 'state-003',
    startStateName: 'PROCESSING',
    endStateName: 'SHIPPED',
    automated: false,                 // ✅ Manual transition (dashed line)
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: ['criteria-002'],
    endProcessesIds: ['process-002'],
  },
  { 
    id: 'trans-003', 
    name: 'Deliver Order', 
    startStateId: 'state-003',
    endStateId: 'state-004',
    startStateName: 'SHIPPED',
    endStateName: 'DELIVERED',
    automated: true,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: [],                  // ✅ No criteria
    endProcessesIds: ['process-003'],
  },
  { 
    id: 'trans-004', 
    name: 'Cancel Order', 
    startStateId: 'state-001',
    endStateId: 'state-005',
    startStateName: 'CREATED',
    endStateName: 'CANCELLED',
    automated: false,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: [],
    endProcessesIds: [],              // ✅ No processes
  },
];
```

## How the Diagram Works

### 1. **States (Nodes)**
- Extracted from transitions using `startStateId` and `endStateId`
- Displayed as green circles
- Current state shown with yellow/orange border
- Positioned using Cytoscape layout algorithm or saved positions

### 2. **Transitions (Edges)**
- Arrows connecting states
- **Automated** transitions: Solid orange arrows with `[A]` prefix
- **Manual** transitions: Dashed arrows with `[M]` prefix
- Labels show transition names

### 3. **Criteria (Compound Nodes)**
- Displayed as light gray boxes at transition midpoints
- Only shown when `showCriteria` is enabled
- Contains criteria nodes linked to the transition

### 4. **Processes (Compound Nodes)**
- Displayed as light blue boxes near end states
- Only shown when `showProcesses` is enabled
- Contains process nodes (heptagons) linked to the transition

## Visual Legend

The diagram includes a legend showing:
- 🟢 **State** - Green circle
- 🟡 **Current State** - Yellow/orange circle with green border
- ⚪ **Criteria** - Light gray compound node
- 🔷 **Process** - Dark blue heptagon
- ➡️ **Automated Transition** - Solid orange arrow
- ➡️ **Manual Transition** - Dashed orange arrow

## Controls Available

### Panel Controls (Top)
- 👁️ **List of transitions** - Toggle transitions list
- 🔧 **processes** - Show/hide process nodes
- 🎯 **criteria** - Show/hide criteria nodes
- 🏷️ **states** - Show/hide state labels
- 🏷️ **transitions titles** - Show/hide transition labels
- 🔄 **Reset positions** - Reset to default layout

### Map Controls (Right)
- 🎯 **Fit Graph** - Fit entire diagram to view
- 🔍 **Zoom In** - Increase zoom level
- 🔍 **Zoom Out** - Decrease zoom level
- ⬅️ **Pan Left** - Move view left
- ➡️ **Pan Right** - Move view right
- ⬆️ **Pan Top** - Move view up
- ⬇️ **Pan Bottom** - Move view down
- 🖥️ **Fullscreen** - Toggle fullscreen mode

## Testing the Fix

### Before Fix
1. Navigate to a workflow detail page
2. Click "Graphical" mode button
3. ❌ Blank canvas with only controls and legend visible
4. ❌ Transitions list empty

### After Fix
1. Navigate to a workflow detail page (e.g., "Order Processing Workflow")
2. Click "Graphical" mode button (middle button with tree icon)
3. ✅ See complete state machine diagram:
   - 5 states: CREATED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
   - 4 transitions connecting the states
   - Criteria nodes (if enabled)
   - Process nodes (if enabled)
   - Interactive controls working

### All Workflows Now Have Diagrams

**Workflow 1: Order Processing**
- States: CREATED → PROCESSING → SHIPPED → DELIVERED (+ CANCELLED)
- 4 transitions with criteria and processes

**Workflow 2: Customer Onboarding**
- States: PENDING → VERIFIED → ACTIVE → SUSPENDED
- 3 transitions

**Workflow 3: Payment Processing**
- States: INITIATED → AUTHORIZED → CAPTURED → SETTLED (+ FAILED)
- 4 transitions

## Files Modified

- `src/__mocks__/@cyoda/http-api-react.ts` - Updated mock transitions data structure

## Technical Details

### Cytoscape.js Integration
The GraphicalStateMachine component uses Cytoscape.js for rendering:
- **Container**: `<div ref={containerRef} />` where Cytoscape mounts
- **Elements**: Nodes (states, criteria, processes) and edges (transitions)
- **Layout**: Breadthfirst algorithm for automatic positioning
- **Styling**: Custom styles for different node/edge types
- **Interactions**: Drag nodes, select elements, pan/zoom

### Data Flow
```
WorkflowDetail.tsx
  ↓ (fetches data)
useTransitions() → transitions array
  ↓ (passes to)
GraphicalStateMachine component
  ↓ (processes with)
getStatesTransitionsEles(transitions)
  ↓ (creates)
Cytoscape elements (nodes + edges)
  ↓ (renders)
Visual diagram
```

## Future Enhancements

1. **Save/Load Positions** - Persist node positions in localStorage
2. **Edit Mode** - Add/edit/delete states and transitions visually
3. **Export Diagram** - Export as PNG/SVG
4. **Minimap** - Show overview of large diagrams
5. **Search** - Highlight specific states/transitions
6. **Validation** - Visual indicators for invalid configurations
7. **Themes** - Different color schemes
8. **Animation** - Animate state transitions

## Related Components

- `GraphicalStateMachine.tsx` - Main component
- `utils.ts` - Helper functions for creating Cytoscape elements
- `style.ts` - Cytoscape stylesheet
- `layouts.ts` - Layout configurations
- `graphicalStatemachineStore.ts` - Zustand store for positions

## Conclusion

The graphical view is now fully functional and displays the state machine diagram correctly. Users can:
- ✅ View all states and transitions
- ✅ See criteria and processes
- ✅ Toggle visibility of different elements
- ✅ Pan, zoom, and interact with the diagram
- ✅ Use fullscreen mode for better viewing

The fix ensures that the React implementation matches the Vue version's functionality for visualizing state machines.

