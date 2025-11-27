# CQL Execution Statistics Tab

**Date**: 2025-11-27  
**Status**: ✅ Complete

---

## Overview

The CQL Execution Statistics tab provides comprehensive monitoring and analysis of Cassandra Query Language (CQL) execution performance across all database tables. This feature helps identify slow queries, monitor database performance, and optimize query execution.

---

## Features

### 1. All Tables Brief Statistics

**Main Table View**:
- Displays statistics for all Cassandra tables in a sortable, paginated table
- Shows key metrics: query count, average/min/max/total execution time
- Scrollable interface for handling large numbers of tables
- Click on any row to view detailed statistics for that table

**Columns**:
- **Table Name** - Name of the Cassandra table (displayed in monospace font)
- **Query Count** - Total number of queries executed
- **Avg Time (ms)** - Average query execution time in milliseconds
- **Min Time (ms)** - Minimum query execution time
- **Max Time (ms)** - Maximum query execution time
- **Total Time (ms)** - Total cumulative execution time

### 2. Table Detail View

**Detail Modal**:
- Opens when clicking on a table row
- Shows comprehensive statistics for the selected table
- Displays detailed query execution information
- Formatted JSON view of all available statistics

### 3. Statistics Management

**Refresh Button**:
- Manually refresh statistics data
- Updates all table statistics
- Shows loading state during refresh

**Clear Statistics Button**:
- Clears all CQL execution statistics
- Confirmation dialog before clearing
- Resets all counters and timing data
- Useful for starting fresh performance monitoring

---

## API Endpoints

### 1. Get All Tables Brief Statistics
```
GET /platform-common/cql-exec-stats/all-tables-brief
```
Returns a list of all tables with brief execution statistics.

**Response Example**:
```json
[
  {
    "tableName": "\"TDB\"",
    "queryCount": 1234,
    "avgExecutionTime": 45.5,
    "minExecutionTime": 10.2,
    "maxExecutionTime": 230.8,
    "totalExecutionTime": 56127.0
  },
  ...
]
```

### 2. Get Table Details
```
GET /platform-common/cql-exec-stats/table/{table}
```
Returns detailed statistics for a specific table.

**Parameters**:
- `table` - Table name (automatically quoted, e.g., `"TDB"`)

**Response Example**:
```json
{
  "tableName": "\"TDB\"",
  "queries": [...],
  "statistics": {...},
  ...
}
```

### 3. Clear Statistics
```
GET /platform-common/cql-exec-stats/clear-cql-exec-stats
```
Clears all CQL execution statistics.

**Response**: Success confirmation

---

## Usage

### Viewing Statistics

1. Navigate to Processing Manager → Nodes
2. Select a node
3. Click on the "CQL Execution Statistics" tab (tab #12)
4. View the table with all statistics
5. Click on any row to see detailed statistics

### Sorting Data

- Click on any column header to sort by that column
- Click again to reverse sort order
- Supports sorting by:
  - Table name (alphabetical)
  - Query count (numerical)
  - Execution times (numerical)

### Pagination

- Default page size: 20 tables
- Available page sizes: 10, 20, 50, 100
- Shows total number of tables
- Navigate between pages using pagination controls

### Refreshing Data

1. Click the "Refresh" button in the top-right corner
2. Wait for the data to reload
3. Table will update with latest statistics

### Clearing Statistics

1. Click the "Clear Statistics" button (red, with trash icon)
2. Confirm the action in the dialog
3. All statistics will be reset to zero
4. Table will automatically refresh

---

## Implementation Details

### Components

**Main Component**: `ShardsDetailTabCqlExecStats.tsx`
- Location: `packages/processing-manager-react/src/components/shards/`
- Uses Ant Design Table component
- Implements modal for detail view
- Handles loading and error states

**Styles**: `ShardsDetailTabCqlExecStats.scss`
- Custom styling for table rows
- Hover effects
- Monospace font for table names

### Hooks

**React Query Hooks** (in `usePlatformCommon.ts`):
- `useCqlExecStatsAllTablesBrief()` - Fetch all tables statistics
- `useCqlExecStatsTable(table)` - Fetch specific table details
- `useClearCqlExecStats()` - Clear statistics mutation

**Query Keys**:
```typescript
platformCommonKeys.cqlExecStats() // All tables
platformCommonKeys.cqlExecStatsTable(table) // Specific table
```

### API Functions

**API Functions** (in `packages/http-api-react/src/api/config.ts`):
```typescript
getCqlExecStatsAllTablesBrief()
getCqlExecStatsTable(table: string)
getCqlExecStatsClear()
```

---

## Testing

### Unit Tests

**Test File**: `__tests__/ShardsDetailTabCqlExecStats.test.tsx`

**Test Coverage**:
- ✅ Component renders without crashing
- ✅ Displays refresh and clear buttons
- ✅ Shows loading state
- ✅ Displays table data when loaded
- ✅ Shows error message on fetch failure
- ✅ Handles empty data
- ✅ Correct table columns

**Run Tests**:
```bash
npm test -- ShardsDetailTabCqlExecStats.test.tsx
```

### E2E Tests

The tab is included in the Processing Manager E2E tests:
```bash
npm run test:e2e -- processing-manager.spec.ts
```

---

## Performance Considerations

### Optimization Features

1. **Lazy Loading**: Tab content only loads when active
2. **Pagination**: Handles large numbers of tables efficiently
3. **React Query Caching**: Reduces unnecessary API calls
4. **Placeholder Data**: Shows empty state immediately while loading

### Best Practices

- Use pagination for large datasets
- Clear statistics periodically to avoid data accumulation
- Monitor execution times to identify slow queries
- Sort by max execution time to find performance bottlenecks

---

## Troubleshooting

### Common Issues

**Issue**: Statistics not loading
- **Solution**: Check network connection, verify API endpoint is accessible

**Issue**: Table names not displaying correctly
- **Solution**: Ensure table names are properly quoted in the API response

**Issue**: Clear button not working
- **Solution**: Check user permissions, verify API endpoint is accessible

**Issue**: Modal not showing details
- **Solution**: Check browser console for errors, verify table name is correct

---

## Future Enhancements

Potential improvements for future versions:

1. **Query Details**: Show individual query text and execution plans
2. **Time Range Filtering**: Filter statistics by time period
3. **Export Functionality**: Export statistics to CSV/Excel
4. **Charts**: Visualize execution time trends
5. **Alerts**: Set thresholds for slow queries
6. **Comparison**: Compare statistics across different time periods
7. **Search**: Search for specific tables
8. **Grouping**: Group tables by keyspace

---

## Related Documentation

- [Processing Manager README](../README.md)
- [API Hooks Documentation](./API_HOOKS.md)
- [Implementation Complete](../IMPLEMENTATION_COMPLETE.md)
- [OpenAPI Specification](https://docs.cyoda.net/openapi/openapi.json)

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0  
**Status**: Production Ready

