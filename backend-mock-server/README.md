# Cyoda Backend Mock Server

A comprehensive mock backend server for Cyoda Processing Manager and other applications.

## Features

- ✅ **Dual Port Setup**: Runs on ports 8081 (Processing) and 8082 (API)
- ✅ **Processing Nodes**: Mock processing nodes with status, metrics, and capabilities
- ✅ **Events**: Mock processing events with different types and severities
- ✅ **Tasks**: Mock processing tasks with various statuses and progress
- ✅ **Metrics**: System-wide and node-specific metrics
- ✅ **CORS Enabled**: Works with frontend on different ports
- ✅ **Request Logging**: See all incoming requests

## Quick Start

### 1. Install Dependencies

```bash
cd backend-mock-server
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on:
- **API Server**: http://localhost:8082
- **Processing Server**: http://localhost:8081

## Endpoints

### API Server (Port 8082)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | Server info |
| `/api/health` | GET | Health check |
| `/api/nodes` | GET | Get all processing nodes |
| `/api/nodes/:id` | GET | Get node by ID |
| `/api/events` | GET | Get events (paginated) |
| `/api/tasks` | GET | Get tasks (paginated) |

### Processing Server (Port 8081)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/processing` | GET | Server info |
| `/processing/health` | GET | Health check |
| `/processing/nodes` | GET | Get all processing nodes |
| `/processing/nodes/:id` | GET | Get node by ID |
| `/processing/nodes/:id/metrics` | GET | Get node metrics |
| `/processing/events` | GET | Get events (paginated) |
| `/processing/tasks` | GET | Get tasks (paginated) |
| `/processing/metrics` | GET | Get system metrics |

## Mock Data

The server provides:
- **3 Processing Nodes** (2 online, 1 offline)
- **50 Events** (various types and severities)
- **20 Tasks** (various statuses and types)

### Node Data

Each node includes:
- ID, name, host, port
- Status (ONLINE/OFFLINE)
- CPU, memory, disk usage
- Uptime and last heartbeat
- Active/completed/failed task counts
- Capabilities

### Event Data

Each event includes:
- ID, type, severity
- Message and timestamp
- Associated node ID
- Metadata

### Task Data

Each task includes:
- ID, name, type
- Status and progress
- Start/end times
- Associated node ID
- Priority and metadata

## Usage with Processing Manager

### 1. Start the Mock Backend

```bash
cd backend-mock-server
npm install
npm start
```

### 2. Start Processing Manager

```bash
cd react-project/packages/processing-manager-react
npm run dev
```

### 3. Open Browser

Navigate to http://localhost:3008

The Processing Manager will connect to the mock backend and display:
- Processing nodes with status
- Events stream
- Tasks list
- System metrics

## Testing Endpoints

### Test API Server

```bash
# Health check
curl http://localhost:8082/api/health

# Get nodes
curl http://localhost:8082/api/nodes

# Get events
curl http://localhost:8082/api/events?page=0&size=10

# Get tasks
curl http://localhost:8082/api/tasks
```

### Test Processing Server

```bash
# Health check
curl http://localhost:8081/processing/health

# Get nodes
curl http://localhost:8081/processing/nodes

# Get node metrics
curl http://localhost:8081/processing/nodes/node-1/metrics

# Get events
curl http://localhost:8081/processing/events?page=0&size=10

# Get tasks
curl http://localhost:8081/processing/tasks?status=RUNNING

# Get system metrics
curl http://localhost:8081/processing/metrics
```

## Query Parameters

### Events Endpoint

- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `sort` - Sort order (default: timestamp,desc)

Example:
```bash
curl "http://localhost:8081/processing/events?page=0&size=5&sort=timestamp,desc"
```

### Tasks Endpoint

- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `status` - Filter by status (RUNNING, COMPLETED, FAILED, PENDING)

Example:
```bash
curl "http://localhost:8081/processing/tasks?status=RUNNING&page=0&size=10"
```

## Customization

### Adding More Nodes

Edit `server.mjs` and add to the `mockNodes` array:

```javascript
{
  id: 'node-4',
  name: 'Processing Node 4',
  host: 'localhost',
  port: 8084,
  status: 'ONLINE',
  // ... other properties
}
```

### Adding More Events

The server generates 50 events on startup. To add more, increase the loop count:

```javascript
for (let i = 0; i < 100; i++) { // Change from 50 to 100
  // ...
}
```

### Adding More Tasks

Similar to events, increase the loop count:

```javascript
for (let i = 0; i < 50; i++) { // Change from 20 to 50
  // ...
}
```

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Port Already in Use

If you see "Port already in use" error:

```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Find and kill process on port 8082
lsof -ti:8082 | xargs kill -9
```

### CORS Errors

The server has CORS enabled by default. If you still see CORS errors:
1. Check the frontend is making requests to the correct URLs
2. Verify the server is running
3. Check browser console for specific error messages

### No Data in Processing Manager

1. Verify the server is running
2. Check the Processing Manager environment variables point to localhost:8081/8082
3. Check browser console for API errors
4. Verify endpoints are accessible (use curl commands above)

## Integration with Frontend

The Processing Manager is already configured to use:
- API Base: `http://localhost:8082/api`
- Processing Base: `http://localhost:8081/processing`

No additional configuration needed!

## Development

### File Structure

```
backend-mock-server/
├── server.mjs       # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Endpoints

Edit `server.mjs` and add new routes:

```javascript
// For API server (port 8082)
apiApp.get('/api/your-endpoint', (req, res) => {
  res.json({ data: 'your data' });
});

// For Processing server (port 8081)
processingApp.get('/processing/your-endpoint', (req, res) => {
  res.json({ data: 'your data' });
});
```

## License

MIT

