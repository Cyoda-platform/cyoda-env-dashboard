# 🚀 START HERE - Connect to Cyoda Backend

## ⚡ Fastest Way to Get Started

Run this single command:

```bash
./connect-backend.sh
```

This interactive script will guide you through all options!

---

## 🎯 Three Ways to Connect

### 1️⃣ Mock Server (No Backend Needed) - **RECOMMENDED FOR TESTING**

Perfect if you don't have a Cyoda backend running.

```bash
# Terminal 1: Start mock server
cd react-project/packages/tableau-react
node test-data/mock-server.mjs

# Terminal 2: Start frontend
cd react-project/packages/tableau-react
npm run dev

# Open: http://localhost:3007
```

### 2️⃣ Local Backend (localhost:8080)

If you have Cyoda backend running locally:

```bash
# Quick setup
cd react-project
./scripts/setup-backend-connection.sh local
npm run dev
```

### 3️⃣ Remote Backend (Custom URL)

Connect to a remote Cyoda instance:

```bash
# Setup with custom URL
cd react-project
./scripts/setup-backend-connection.sh remote
# (You'll be prompted for the URL)
npm run dev
```

---

## 📋 What You Get

After connecting, you can access these applications:

| App | URL | Description |
|-----|-----|-------------|
| **COBI** | http://localhost:3009 | Main data mapping app |
| **Tasks** | http://localhost:3010 | Task management |
| **Processing** | http://localhost:3008 | Processing monitor |
| **Tableau** | http://localhost:3007 | Report viewer |
| **Source Config** | http://localhost:5176 | Data source config |
| **State Machine** | http://localhost:3014 | Workflow engine |
| **SaaS** | http://localhost:3011 | SaaS application |

---

## 🛠️ Available Tools

### Interactive Helper
```bash
./connect-backend.sh
```
Guides you through all options with a menu.

### Test Connection
```bash
./react-project/scripts/test-backend-connection.sh
```
Tests if backend is accessible.

### Setup Connection
```bash
cd react-project
./scripts/setup-backend-connection.sh [local|remote]
```
Configures all packages to connect to backend.

---

## 📚 Documentation

- **BACKEND_CONNECTION_SETUP_COMPLETE.md** - Complete setup summary
- **BACKEND_CONNECTION_GUIDE.md** - Detailed guide
- **react-project/CONNECT_TO_BACKEND.md** - Quick reference

---

## 🎬 Quick Demo

Let's try the mock server (fastest option):

```bash
# 1. Start mock server (Terminal 1)
cd react-project/packages/tableau-react
node test-data/mock-server.mjs

# 2. Start frontend (Terminal 2)
cd react-project/packages/tableau-react
npm run dev

# 3. Open browser
# Visit: http://localhost:3007
```

You should see the Tableau Reports application with test data!

---

## ❓ Need Help?

### Backend not running?
→ Use the mock server (Option 1)

### Want to test quickly?
→ Run `./connect-backend.sh` and choose option 1

### Have a real backend?
→ Run `./connect-backend.sh` and choose option 2 or 3

### Want to see all options?
→ Read **BACKEND_CONNECTION_GUIDE.md**

---

## ✅ Next Steps

1. Choose your connection method (above)
2. Run the commands
3. Open your browser
4. Start developing!

---

**Ready? Run this now:**

```bash
./connect-backend.sh
```

🎉 **Happy Coding!**

