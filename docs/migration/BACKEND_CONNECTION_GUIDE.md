# Cyoda Backend Connection Guide

This guide will help you connect the Cyoda React frontend to the backend server.

## 🎯 Quick Start

### Option 1: Connect to Local Backend (Recommended for Development)

If you have a Cyoda backend running locally on port 8080:

```bash
cd react-project

# Create environment configuration for all packages
./scripts/setup-backend-connection.sh local
```

### Option 2: Connect to Remote Backend

If you want to connect to a remote Cyoda backend:

```bash
cd react-project

# You'll be prompted for the backend URL
./scripts/setup-backend-connection.sh remote
```

### Option 3: Use CLI Setup Tool

Use the interactive CLI tool for detailed configuration:

```bash
cd react-project/packages/cobi-react  # or any other package
npx @cyoda/cli setup
```

---

## 📋 Manual Configuration

### Step 1: Create Environment Files

Create `.env.development.local` files in the packages you want to run:

#### For COBI (Main Application)
```bash
# react-project/packages/cobi-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For Tasks Module
```bash
# react-project/packages/tasks-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For Processing Manager
```bash
# react-project/packages/processing-manager-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For Tableau Reports
```bash
# react-project/packages/tableau-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For Source Configuration
```bash
# react-project/packages/source-configuration-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For State Machine
```bash
# react-project/packages/statemachine-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

#### For SaaS Application
```bash
# react-project/packages/cyoda-sass-react/.env.development.local
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing
VITE_APP_DEBUG=true
```

### Step 2: Update Processing Manager Config

Edit the config file for Processing Manager:

```bash
# react-project/packages/processing-manager-react/public/config.json
{
  "apiBaseUrl": "http://localhost:8080",
  "grafanaUrl": "http://localhost:3000",
  "enableSSH": true,
  "pollingInterval": 30000
}
```

---

## 🔧 Backend Requirements

### What You Need

1. **Cyoda Backend Server** running on port 8080 (default)
2. **Required Endpoints**:
   - Main API: `http://localhost:8080/api` or `/platform-api`
   - Processing API: `http://localhost:8080/processing` or `/platform-processing`

### Verify Backend is Running

```bash
# Check if backend is accessible
curl http://localhost:8080/api

# Or check platform-api
curl http://localhost:8080/platform-api
```

Expected response: HTTP 401 (Unauthorized) or 200 (OK) - this means the backend is running.

---

## 🚀 Starting the Frontend

### Start All Packages

```bash
cd react-project
npm install  # or yarn install
npm run dev  # or yarn dev
```

### Start Individual Packages

```bash
# COBI (Main Application) - http://localhost:3009
cd react-project/packages/cobi-react
npm run dev

# Tasks Module - http://localhost:3010
cd react-project/packages/tasks-react
npm run dev

# Processing Manager - http://localhost:3008
cd react-project/packages/processing-manager-react
npm run dev

# Tableau Reports - http://localhost:3007
cd react-project/packages/tableau-react
npm run dev

# Source Configuration - http://localhost:5176
cd react-project/packages/source-configuration-react
npm run dev

# State Machine - http://localhost:3014
cd react-project/packages/statemachine-react
npm run dev

# SaaS Application - http://localhost:3011
cd react-project/packages/cyoda-sass-react
npm run dev
```

---

## 🔐 Authentication

### Login Methods

The application supports two authentication methods:

1. **Username/Password Login**
   - Endpoint: `POST /platform-api/auth/login`
   - Body: `{ username, password }`

2. **Auth0 Login** (Optional)
   - Endpoint: `POST /platform-api/auth/auth0`
   - Requires Auth0 configuration

### Configure Auth0 (Optional)

Add to your `.env.development.local`:

```bash
VITE_APP_AUTH0_DOMAIN=your-domain.auth0.com
VITE_APP_AUTH0_CLIENT_ID=your-client-id
VITE_APP_AUTH0_AUDIENCE=https://your-api.com/api
VITE_APP_AUTH0_REDIRECT_URI=http://localhost:3009
VITE_APP_AUTH0_ORGANIZATION=your-org-id
```

---

## 🧪 Testing Without Backend

### Use Mock Servers

Some packages include mock servers for testing:

```bash
# Tableau Mock Server
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
# Server runs on http://localhost:8080
```

Then start the frontend in another terminal:

```bash
cd react-project/packages/tableau-react
npm run dev
```

---

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem**: "Network Error" or "Failed to fetch"

**Solutions**:
1. Verify backend is running: `curl http://localhost:8080/api`
2. Check CORS settings on backend
3. Verify environment variables are loaded
4. Check browser console for detailed errors

### Environment Variables Not Loading

**Problem**: API calls go to wrong URL

**Solutions**:
1. Restart the dev server after creating `.env.development.local`
2. Clear browser cache
3. Check file is named exactly `.env.development.local`
4. Verify file is in the correct package directory

### Port Already in Use

**Problem**: "Port 3009 is already in use"

**Solutions**:
```bash
# Find and kill the process
lsof -ti:3009 | xargs kill -9

# Or change the port in vite.config.ts
```

### CORS Errors

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
1. Backend must allow CORS from frontend origin
2. Use Vite proxy (already configured in most packages)
3. Check backend CORS configuration

---

## 📊 Available Packages & Ports

| Package | Port | URL | Purpose |
|---------|------|-----|---------|
| COBI | 3009 | http://localhost:3009 | Main application |
| Tasks | 3010 | http://localhost:3010 | Task management |
| Processing Manager | 3008 | http://localhost:3008 | Processing monitoring |
| Tableau | 3007 | http://localhost:3007 | Report viewer |
| Source Config | 5176 | http://localhost:5176 | Data source config |
| State Machine | 3014 | http://localhost:3014 | Workflow engine |
| SaaS | 3011 | http://localhost:3011 | SaaS application |

---

## 🔗 Next Steps

1. ✅ Configure backend connection (this guide)
2. 📦 Install dependencies: `npm install`
3. 🚀 Start development server: `npm run dev`
4. 🔐 Login to the application
5. 🧪 Test the connection

---

## 📚 Additional Resources

- [Main README](react-project/README.md)
- [Quick Start Guide](react-project/QUICK_START.md)
- [HTTP API Documentation](react-project/packages/http-api-react/README.md)
- [CLI Tool Documentation](react-project/packages/cli/README.md)

---

**Need Help?** Check the browser console and network tab for detailed error messages.

