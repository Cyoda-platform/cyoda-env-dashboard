# Error Handling in http-api-react

## Overview

This package provides comprehensive error handling for HTTP API requests, including support for error message dictionaries similar to the Vue project.

## Error Dictionary

The error dictionary (`src/dictionaries/errorMessages.json`) contains mappings from error codes to user-friendly messages. This is particularly useful for state machine and validation errors returned by the Cyoda backend.

### Supported Error Codes

- `NON_EXISTING_TRANSITION` - "Transition doesn't exist"
- `ILLEGAL_UPDATE_CHANGES` - "Such changes are not allowed on update, maybe you want to create new entity?"
- `NON_EXISTING_WORKFLOW` - "Workflow doesn't exist"
- `NON_EXISTING_STATE` - "State doesn't exist"
- And many more...

See `src/dictionaries/errorMessages.json` for the complete list.

## How It Works

### Error Response Format

When the backend returns errors in the following format:

```json
{
  "errors": {
    "field1": "NON_EXISTING_TRANSITION",
    "field2": "ILLEGAL_UPDATE_CHANGES"
  }
}
```

The error handler will:
1. Check if the errors object contains codes from the dictionary
2. Convert each error code to a user-friendly message
3. Display each message as a notification

### Example

**Backend Response:**
```json
{
  "errors": {
    "transition": "NON_EXISTING_TRANSITION"
  }
}
```

**User Sees:**
```
Error
Transition doesn't exist
```

## Usage

The error handling is automatic through axios interceptors. All axios instances in the project use the `HelperErrors.handler()` method to process errors.

### Manual Error Handling

If you need to handle errors manually:

```typescript
import { HelperErrors } from '@cyoda/http-api-react';

try {
  // Your API call
} catch (error) {
  HelperErrors.handler(error);
}
```

### Muting Errors

To prevent automatic error display for specific requests:

```typescript
import { instance } from '@cyoda/http-api-react';

const response = await instance.get('/api/endpoint', {
  muteErrors: true
} as any);
```

## Error Display Types

### 1. Dictionary Errors (Object with error codes)
- Displayed as: **Notification** (top-right corner)
- Used for: Validation and state machine errors

### 2. Server Errors (500)
- Displayed as: **Modal Dialog**
- Includes error code if available

### 3. Other HTTP Errors (400, 403, 503, etc.)
- Displayed as: **Message** (top-center)
- Format: `{Status}: {Error Message}`

### 4. Network Errors
- Displayed as: **Message**
- Example: "Network Error"

## Migration from Vue

This implementation is fully compatible with the Vue project's error handling:

- ✅ Error dictionary support
- ✅ Same error codes and messages
- ✅ Similar UI feedback (notifications for dictionary errors)
- ✅ Automatic error handling through interceptors

## Testing

Comprehensive tests are available in `src/utils/errors.test.ts`, covering:
- All HTTP status codes
- Dictionary error handling
- Mixed known/unknown error codes
- Edge cases (empty data, null values, etc.)

Run tests:
```bash
npm test -- packages/http-api-react/src/utils/errors.test.ts
```

