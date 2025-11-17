# Error Handling Examples

## Example 1: State Machine Transition Error

When trying to update a transition that doesn't exist:

**Backend Response:**
```json
{
  "status": 400,
  "data": {
    "errors": {
      "transition": "NON_EXISTING_TRANSITION"
    }
  }
}
```

**What User Sees:**
- A notification in the top-right corner
- Title: "Error"
- Description: "Transition doesn't exist"

## Example 2: Illegal Update

When trying to make changes that are not allowed:

**Backend Response:**
```json
{
  "status": 400,
  "data": {
    "errors": {
      "update": "ILLEGAL_UPDATE_CHANGES"
    }
  }
}
```

**What User Sees:**
- A notification in the top-right corner
- Title: "Error"
- Description: "Such changes are not allowed on update, maybe you want to create new entity?"

## Example 3: Multiple Errors

When multiple validation errors occur:

**Backend Response:**
```json
{
  "status": 400,
  "data": {
    "errors": {
      "workflow": "NON_EXISTING_WORKFLOW",
      "state": "NON_EXISTING_STATE",
      "transition": "NON_EXISTING_TRANSITION"
    }
  }
}
```

**What User Sees:**
- Three separate notifications, each with:
  - Title: "Error"
  - Descriptions:
    - "Workflow doesn't exist"
    - "State doesn't exist"
    - "Transition doesn't exist"

## Example 4: Server Error (500)

When a server error occurs:

**Backend Response:**
```json
{
  "status": 500,
  "data": {
    "detail": "Internal server error occurred",
    "properties": {
      "errorCode": "ERR-12345"
    }
  }
}
```

**What User Sees:**
- A modal dialog with:
  - Title: "Error!"
  - Content: "The Cyoda server encountered an unexpected error: Internal server error occurred\n\nIf assistance is needed, you may check available support options and provide the unique error code ERR-12345 if contacting support."

## Example 5: Network Error

When network is unavailable:

**What User Sees:**
- A message in the top-center
- Text: "Network Error"

## Testing Error Handling

To test error handling in your development environment:

1. **Test Dictionary Errors:**
   - Try to update a non-existing transition
   - Try to delete a workflow with transitions
   - Try to make illegal changes to a state machine

2. **Test Server Errors:**
   - Simulate a 500 error from the backend
   - Check that the modal appears with error details

3. **Test Network Errors:**
   - Disconnect from network
   - Try to make an API call
   - Check that network error message appears

## Code Example

```typescript
import { instance } from '@cyoda/http-api-react';

// This will automatically show error notifications if the backend returns error codes
try {
  await instance.put('/api/statemachine/transitions/123', {
    name: 'Updated Transition',
    // ... other fields
  });
} catch (error) {
  // Error is already handled by the interceptor
  // You can add additional logic here if needed
  console.error('Failed to update transition:', error);
}

// To mute automatic error handling:
try {
  await instance.get('/api/statemachine/workflows', {
    muteErrors: true
  } as any);
} catch (error) {
  // Handle error manually
  HelperErrors.handler(error);
}
```

