# Real Backend Data Only - No Mock Fallbacks

## Summary

The saas app now **only uses real Cyoda backend data** and **never falls back to mock data**. When API calls fail or return empty data, the app will handle the actual response instead of substituting fake mock data.

## Changes Made

### 1. **getReportingFetchTypes** - Entity Class List
**Before:**
- Fell back to mock entity class list when API failed or returned empty data
- Used `MOCK_ENTITY_CLASSES` and `MOCK_DYNAMIC_ENTITY_CLASSES`

**After:**
```typescript
export async function getReportingFetchTypes(onlyDynamic = false) {
  const response = await axios.get<string[]>(
    `/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`
  );
  return response;
}
```
- Always returns actual API response
- If API fails, the error will be thrown and handled by the UI

---

### 2. **getReportingInfo** - Entity Field Information
**Before:**
- Fell back to `getMockEntityInfo()` when API failed or returned empty data
- Created fake field data with owner, category, metadata, etc.

**After:**
```typescript
export async function getReportingInfo(
  entityClass: string,
  parentFldClass: string = '',
  columnPath: string = '',
  onlyRange: boolean = false
) {
  const params: any = { entityModel: entityClass };
  if (parentFldClass) params.parentFieldType = encodeURIComponent(parentFldClass);
  if (columnPath) params.columnPath = encodeURIComponent(columnPath);
  if (onlyRange) params.onlyRange = onlyRange;

  const query = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const response = await axios.get(`/platform-api/entity-info/model-info?${query}`);
  return response;
}
```
- Always returns actual API response
- If API fails, the error will be thrown and handled by the UI

---

### 3. **getReportingRelatedPaths** - JOIN Relationships
**Before:**
- Fell back to mock related paths with fake joins for owner, category, metadata
- This caused the bug where `owner (User)` was clickable when it shouldn't be

**After:**
```typescript
export async function getReportingRelatedPaths(entityClass: string) {
  const response = await axios.get(
    `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
  );
  return response;
}
```
- Always returns actual API response (even if empty array)
- Empty array means no JOIN relationships exist for this entity
- If API fails, the error will be thrown and handled by the UI

---

## Bug Fixed: owner (User) Field Not Clickable

### The Problem
In the React version, the `owner (User)` field in EntityModel was clickable and tried to open a User entity box, causing 500 errors. In the Vue version, it was correctly **not clickable**.

### Root Cause
When the API returned empty data for `relatedPaths`, the code fell back to mock data that incorrectly included:
```typescript
{
  columnPath: 'owner',
  path: 'owner',
  targetEntityClass: 'com.cyoda.core.User',
  joinType: 'MANY_TO_ONE'
}
```

This made the React code think `owner` was a JOIN relationship when it's actually just a nested OBJECT field.

### The Fix
Now when the API returns an empty array for `relatedPaths`, the app uses that empty array. This means:
- ✅ `owner` field is **not** marked as a JOIN relationship
- ✅ `owner` field is **not** clickable in Entity Viewer
- ✅ Matches the Vue project behavior exactly

---

## Important Distinction: OBJECT vs JOIN

### OBJECT Type Fields (Nested Objects)
- Fields like `owner`, `metadata`, `category` with `type: 'OBJECT'`
- Have `elementInfo` or `elementType` properties
- Expand to show their nested properties **inline**
- Are **not** clickable in Entity Viewer
- Do **not** appear in `relatedPaths`

### JOIN Relationships
- Defined in the backend with explicit JOIN annotations
- Appear in the `relatedPaths` API response
- Show a link icon in the UI
- Are **clickable** in Entity Viewer to open a new entity box
- Create relationships between separate entity boxes

---

## Testing

To verify the changes work correctly:

1. **Open Entity Viewer** at `/entity-viewer`
2. **Select EntityModel** from the dropdown
3. **Verify** that the `owner` field is **not clickable** (no link icon)
4. **Verify** that nested fields like `changeLog` and `modelElements` are expandable (have arrow icon)
5. **Check console** - should see no warnings about "using mock data"

---

## Files Modified

- `react-project/packages/http-api-react/src/api/entities.ts`
  - Removed `MOCK_ENTITY_CLASSES` constant
  - Removed `MOCK_DYNAMIC_ENTITY_CLASSES` constant
  - Removed `getMockEntityInfo()` function
  - Removed `getMockRelatedPaths()` function
  - Updated `getReportingFetchTypes()` to not use mock fallback
  - Updated `getReportingInfo()` to not use mock fallback
  - Updated `getReportingRelatedPaths()` to not use mock fallback

- `react-project/packages/tableau-react/src/api/modelling.ts`
  - Updated `getReportingRelatedPaths()` to match http-api-react implementation
  - Added better comments explaining OBJECT vs JOIN distinction

---

## Migration Notes

If you need to add mock data support back for a **demo app** (not saas app), you should:

1. Create a separate demo-specific API wrapper
2. Keep the real backend API functions unchanged
3. Use environment variables to switch between real and mock data
4. Never mix mock and real data in the same function

Example:
```typescript
// For demo app only
export async function getReportingInfoDemo(entityClass: string) {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    return { data: getMockEntityInfo(entityClass) };
  }
  return getReportingInfo(entityClass);
}
```

