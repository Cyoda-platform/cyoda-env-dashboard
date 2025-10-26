# 🔌 Connect to Cyoda Backend - Quick Guide

## Current Status

✗ **Backend is NOT currently running on localhost:8080**

You have 3 options to proceed:

---

## Option 1: Use Mock Server (Fastest - No Backend Needed) ⚡

Perfect for testing the UI without a real backend.

### Start Mock Server

```bash
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

This will start a mock API server on `http://localhost:8080` with test data.

### Then Start Frontend

In another terminal:

```bash
cd react-project/packages/tableau-react
npm run dev
```

Visit: http://localhost:3007

---

## Option 2: Connect to Local Backend 🏠

If you have a Cyoda backend running locally:

### 1. Start Your Backend Server

Make sure your Cyoda backend is running on port 8080.

### 2. Test Connection

```bash
cd react-project
./scripts/test-backend-connection.sh
```

### 3. Configure Frontend

```bash
cd react-project
./scripts/setup-backend-connection.sh local
```

### 4. Start Frontend

```bash
npm run dev
```

---

## Option 3: Connect to Remote Backend 🌐

If you want to connect to a remote Cyoda instance:

### 1. Run Setup Script

```bash
cd react-project
./scripts/setup-backend-connection.sh remote
```

You'll be prompted for the backend URL (e.g., `https://dev.cyoda.com`)

### 2. Start Frontend

```bash
npm run dev
```

---

## Quick Commands Reference

### Test Backend Connection
```bash
./react-project/scripts/test-backend-connection.sh
# Or test a specific URL:
./react-project/scripts/test-backend-connection.sh https://dev.cyoda.com
```

### Setup Backend Connection
```bash
# Interactive mode (asks questions)
./react-project/scripts/setup-backend-connection.sh

# Local backend (localhost:8080)
./react-project/scripts/setup-backend-connection.sh local

# Remote backend (prompts for URL)
./react-project/scripts/setup-backend-connection.sh remote
```

### Start Development Server
```bash
cd react-project

# Start all packages
npm run dev

# Or start specific package
cd packages/cobi-react && npm run dev
```

---

## Available Applications

Once connected, you can access:

| Application | Port | URL | Description |
|-------------|------|-----|-------------|
| **COBI** | 3009 | http://localhost:3009 | Main data mapping application |
| **Tasks** | 3010 | http://localhost:3010 | Task management |
| **Processing Manager** | 3008 | http://localhost:3008 | Monitor processing nodes |
| **Tableau** | 3007 | http://localhost:3007 | Report viewer |
| **Source Config** | 5176 | http://localhost:5176 | Configure data sources |
| **State Machine** | 3014 | http://localhost:3014 | Workflow engine |
| **SaaS** | 3011 | http://localhost:3011 | SaaS application |

---

## Troubleshooting

### "Backend is not accessible"

**Solution**: 
1. Check if backend is running: `curl http://localhost:8080`
2. Start the backend server
3. Or use the mock server (Option 1)

### "Port already in use"

**Solution**:
```bash
# Find and kill the process
lsof -ti:3009 | xargs kill -9

# Or change port in vite.config.ts
```

### "Environment variables not loading"

**Solution**:
1. Restart dev server after creating `.env.development.local`
2. Check file is in correct package directory
3. File must be named exactly `.env.development.local`

### "CORS errors"

**Solution**:
- Vite proxy is already configured
- Backend must allow CORS from frontend origin
- Check backend CORS settings

---

## What's Next?

1. ✅ Choose your connection option (above)
2. 📦 Install dependencies: `npm install`
3. 🚀 Start development server
4. 🔐 Login to the application
5. 🧪 Test the features

---

## Need More Help?

- 📖 [Full Backend Connection Guide](../BACKEND_CONNECTION_GUIDE.md)
- 📖 [Main README](README.md)
- 📖 [Quick Start Guide](QUICK_START.md)
- 📖 [HTTP API Documentation](packages/http-api-react/README.md)

---

**Pro Tip**: Start with the mock server (Option 1) to quickly test the UI!

