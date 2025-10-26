# ✅ Backend Connection Setup Complete

I've created a complete setup to help you connect to the Cyoda backend!

## 🎯 What's Been Created

### 1. **Interactive Connection Helper** (Easiest!)
```bash
./connect-backend.sh
```

This interactive script will guide you through:
- 🚀 Starting a mock server (no backend needed)
- 🏠 Connecting to local backend
- 🌐 Connecting to remote backend
- 🧪 Testing backend connection
- ℹ️ Viewing connection info

### 2. **Automated Setup Scripts**

#### Setup Backend Connection
```bash
cd react-project

# Interactive mode (asks questions)
./scripts/setup-backend-connection.sh

# Quick setup for local backend
./scripts/setup-backend-connection.sh local

# Setup for remote backend
./scripts/setup-backend-connection.sh remote
```

#### Test Backend Connection
```bash
# Test default localhost:8080
./react-project/scripts/test-backend-connection.sh

# Test custom URL
./react-project/scripts/test-backend-connection.sh https://dev.cyoda.com
```

### 3. **Documentation**

- **BACKEND_CONNECTION_GUIDE.md** - Comprehensive guide with all details
- **react-project/CONNECT_TO_BACKEND.md** - Quick reference guide

---

## 🚀 Quick Start (3 Options)

### Option 1: Mock Server (Recommended for Testing)

**No backend needed! Perfect for UI testing.**

```bash
# Terminal 1: Start mock server
cd react-project/packages/tableau-react
node test-data/mock-server.mjs

# Terminal 2: Start frontend
cd react-project/packages/tableau-react
npm run dev

# Visit: http://localhost:3007
```

### Option 2: Local Backend

**If you have Cyoda backend running on localhost:8080**

```bash
# 1. Test connection
./react-project/scripts/test-backend-connection.sh

# 2. Setup connection
cd react-project
./scripts/setup-backend-connection.sh local

# 3. Start frontend
npm run dev
```

### Option 3: Remote Backend

**Connect to a remote Cyoda instance**

```bash
# 1. Setup connection (will prompt for URL)
cd react-project
./scripts/setup-backend-connection.sh remote

# 2. Start frontend
npm run dev
```

---

## 📊 Current Status

### Backend Connection Test Results

```
Testing http://localhost:8080...              ✗ Not running
Testing http://localhost:8080/api...          ✗ Not running
Testing http://localhost:8080/platform-api... ✗ Not running
```

**Recommendation**: Start with the **Mock Server** (Option 1) to test the UI immediately!

---

## 🎨 Available Applications

Once connected, you can access these applications:

| Application | Port | URL | Description |
|-------------|------|-----|-------------|
| **COBI** | 3009 | http://localhost:3009 | Main data mapping application |
| **Tasks** | 3010 | http://localhost:3010 | Task management module |
| **Processing Manager** | 3008 | http://localhost:3008 | Monitor processing nodes |
| **Tableau** | 3007 | http://localhost:3007 | Report viewer |
| **Source Config** | 5176 | http://localhost:5176 | Configure data sources |
| **State Machine** | 3014 | http://localhost:3014 | Workflow engine |
| **SaaS** | 3011 | http://localhost:3011 | SaaS application |

---

## 🔧 What the Setup Scripts Do

### 1. Create Environment Files

The scripts create `.env.development.local` files in each package:

```env
# API Configuration
VITE_APP_API_BASE=http://localhost:8080/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8080/processing

# Debug
VITE_APP_DEBUG=true
```

### 2. Update Processing Manager Config

Updates `packages/processing-manager-react/public/config.json`:

```json
{
  "apiBaseUrl": "http://localhost:8080",
  "grafanaUrl": "http://localhost:3000",
  "enableSSH": true,
  "pollingInterval": 30000
}
```

### 3. Configure All Packages

Automatically configures:
- ✅ cobi-react
- ✅ tasks-react
- ✅ processing-manager-react
- ✅ source-configuration-react
- ✅ statemachine-react
- ✅ cyoda-sass-react
- ✅ tableau-react

---

## 🎬 Next Steps

### Recommended Path:

1. **Try the Interactive Helper**
   ```bash
   ./connect-backend.sh
   ```
   Choose option 1 (Mock Server) for immediate testing!

2. **Install Dependencies** (if not done)
   ```bash
   cd react-project
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Visit http://localhost:3009 (COBI)
   - Or any other application from the table above

---

## 🐛 Troubleshooting

### "Backend is not accessible"
- ✅ Use mock server: `cd react-project/packages/tableau-react && node test-data/mock-server.mjs`
- ✅ Start your backend server
- ✅ Check backend URL is correct

### "Port already in use"
```bash
# Find and kill the process
lsof -ti:3009 | xargs kill -9
```

### "Environment variables not loading"
- ✅ Restart dev server after creating `.env.development.local`
- ✅ Check file is in correct package directory
- ✅ File must be named exactly `.env.development.local`

### "CORS errors"
- ✅ Vite proxy is already configured
- ✅ Backend must allow CORS from frontend origin

---

## 📚 Documentation Reference

- **BACKEND_CONNECTION_GUIDE.md** - Full guide with all options
- **react-project/CONNECT_TO_BACKEND.md** - Quick reference
- **react-project/README.md** - Main project documentation
- **react-project/QUICK_START.md** - Development guide

---

## 🎯 Summary

You now have everything you need to connect to the Cyoda backend:

✅ **Interactive helper script** - `./connect-backend.sh`
✅ **Automated setup scripts** - `./react-project/scripts/setup-backend-connection.sh`
✅ **Connection testing** - `./react-project/scripts/test-backend-connection.sh`
✅ **Mock server available** - For testing without backend
✅ **Complete documentation** - Multiple guides for reference

---

## 🚀 Ready to Start?

Run this command to get started:

```bash
./connect-backend.sh
```

Or jump straight to the mock server:

```bash
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

Then in another terminal:

```bash
cd react-project/packages/tableau-react
npm run dev
```

**Happy coding! 🎉**

