# 🚀 Running Processing Manager

## Current Configuration

✅ **Environment configured for local development**

### Backend Configuration
- **API Base**: `http://localhost:8082/api`
- **Processing API**: `http://localhost:8081/processing`
- **Base URL**: `http://localhost:8081/`

### Grafana Configuration
- **Grafana URL**: `https://grafana.cyoda.com/api`
- **API Key**: Configured
- **Server Source ID**: 1

### Frontend
- **Processing Manager**: `http://localhost:3008`

---

## Prerequisites

### Required Backend Services

You need the following services running:

1. **Cyoda Backend API** - Port 8082
   - Endpoint: `http://localhost:8082/api`
   
2. **Cyoda Processing Service** - Port 8081
   - Endpoint: `http://localhost:8081/processing`

3. **Grafana** (Optional) - Port 3000
   - Endpoint: `http://localhost:3000`

---

## Starting the Processing Manager

### Option 1: Start Processing Manager Only

```bash
cd react-project/packages/processing-manager-react
npm run dev
```

The app will be available at: **http://localhost:3008**

### Option 2: Start All Applications

```bash
cd react-project
npm run dev
```

This starts all packages including Processing Manager.

---

## Verifying Backend Connection

### Test Backend Endpoints

```bash
# Test main API
curl http://localhost:8082/api

# Test processing API
curl http://localhost:8081/processing

# Test specific processing endpoint
curl http://localhost:8081/processing/nodes
```

Expected responses:
- **401 Unauthorized** - Backend is running but needs authentication ✅
- **200 OK** - Backend is running and accessible ✅
- **Connection refused** - Backend is not running ❌

---

## Backend Setup Options

### Option 1: Use Mock Server (No Real Backend)

If you don't have the Cyoda backend running, you can use a mock server:

```bash
# Start mock server (in a separate terminal)
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

**Note**: The mock server runs on port 8080, so you'll need to adjust the config or create a Processing Manager specific mock server.

### Option 2: Connect to Remote Backend

If you want to connect to the remote development backend:

```bash
cd react-project
./scripts/setup-env-from-template.sh remote
```

This will configure:
- API: `https://cyoda-develop.kube.cyoda.org/api`
- Processing: `https://cyoda-develop.kube.cyoda.org/processing`

### Option 3: Start Local Cyoda Backend

If you have the Cyoda backend source code:

```bash
# Navigate to your Cyoda backend directory
cd /path/to/cyoda-backend

# Start the backend services
# (Commands depend on your backend setup)
./start-api.sh        # Port 8082
./start-processing.sh # Port 8081
```

---

## Processing Manager Features

Once running, you can:

### 1. Monitor Processing Nodes
- View all processing nodes
- Check node status (online/offline)
- Monitor node health

### 2. View Processing Events
- Real-time event monitoring
- Event filtering and search
- Event details and logs

### 3. Manage Processing Tasks
- View running tasks
- Monitor task progress
- Cancel or restart tasks

### 4. System Metrics
- CPU and memory usage
- Processing throughput
- Error rates

### 5. Grafana Integration
- View Grafana dashboards
- Monitor system metrics
- Custom dashboard creation

---

## Configuration Files

### Environment Variables
```bash
# Location
react-project/packages/processing-manager-react/.env.development.local

# Key variables
VITE_APP_API_BASE=http://localhost:8082/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
VITE_APP_GRAFANA_API_URL=https://grafana.cyoda.com/api
```

### Runtime Configuration
```bash
# Location
react-project/packages/processing-manager-react/public/config.json

# Configuration
{
  "apiBaseUrl": "http://localhost:8081",
  "grafanaUrl": "http://localhost:3000",
  "enableSSH": true,
  "pollingInterval": 30000
}
```

---

## Troubleshooting

### Backend Connection Issues

**Problem**: "Failed to fetch" or "Network Error"

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:8081/processing
   ```

2. Check environment variables:
   ```bash
   cat react-project/packages/processing-manager-react/.env.development.local
   ```

3. Restart the dev server:
   ```bash
   cd react-project/packages/processing-manager-react
   npm run dev
   ```

### Port Already in Use

**Problem**: "Port 3008 is already in use"

**Solution**:
```bash
# Find and kill the process
lsof -ti:3008 | xargs kill -9

# Or change the port in vite.config.ts
```

### CORS Errors

**Problem**: CORS policy errors in browser console

**Solutions**:
1. Backend must allow CORS from `http://localhost:3008`
2. Check backend CORS configuration
3. Vite proxy is configured in `vite.config.ts`

### No Data Displayed

**Problem**: Processing Manager loads but shows no data

**Solutions**:
1. Check backend is running and accessible
2. Check browser console for API errors
3. Verify authentication (login if required)
4. Check network tab for failed requests

---

## Development Workflow

### 1. Start Backend Services
```bash
# Start your Cyoda backend on ports 8081/8082
# Or use remote backend
```

### 2. Start Processing Manager
```bash
cd react-project/packages/processing-manager-react
npm run dev
```

### 3. Open Browser
```
http://localhost:3008
```

### 4. Login (if required)
- Use your Cyoda credentials
- Or Auth0 authentication

### 5. Monitor Processing
- View nodes, events, tasks
- Check system health
- Monitor metrics

---

## Quick Commands

```bash
# Start Processing Manager
cd react-project/packages/processing-manager-react && npm run dev

# Test backend connection
curl http://localhost:8081/processing

# View environment config
cat react-project/packages/processing-manager-react/.env.development.local

# View runtime config
cat react-project/packages/processing-manager-react/public/config.json

# Check logs
# (Browser console at http://localhost:3008)
```

---

## Next Steps

1. ✅ Environment configured
2. ✅ Configuration files updated
3. 🔄 Start backend services (if not running)
4. 🚀 Start Processing Manager
5. 🌐 Open http://localhost:3008
6. 🔐 Login and start monitoring

---

## Additional Resources

- [Processing Manager README](react-project/packages/processing-manager-react/README.md)
- [Backend Connection Guide](BACKEND_CONNECTION_GUIDE.md)
- [Environment Setup Guide](ENV_SETUP_GUIDE.md)

---

**Ready to start?**

```bash
cd react-project/packages/processing-manager-react
npm run dev
```

Then open: **http://localhost:3008** 🚀

