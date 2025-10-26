# 🚀 Quick Reference - Cyoda Backend Connection

## One-Line Commands

### Interactive Setup (Recommended)
```bash
./connect-backend.sh
```

### Local Development Setup
```bash
cd react-project && ./scripts/setup-env-from-template.sh local && npm run dev
```

### Remote Development Setup
```bash
cd react-project && ./scripts/setup-env-from-template.sh remote && npm run dev
```

### Test Backend Connection
```bash
./react-project/scripts/test-backend-connection.sh
```

---

## Backend URLs

### Local Development
```
API:        http://localhost:8082/api
Processing: http://localhost:8081/processing
Base URL:   http://localhost:8081/
```

### Remote Development (cyoda-develop)
```
API:        https://cyoda-develop.kube.cyoda.org/api
Processing: https://cyoda-develop.kube.cyoda.org/processing
Base URL:   https://cyoda-develop.kube.cyoda.org
```

---

## Frontend Applications

| App | Port | URL |
|-----|------|-----|
| COBI | 3009 | http://localhost:3009 |
| Tasks | 3010 | http://localhost:3010 |
| Processing Manager | 3008 | http://localhost:3008 |
| Tableau | 3007 | http://localhost:3007 |
| Source Config | 5176 | http://localhost:5176 |
| State Machine | 3014 | http://localhost:3014 |
| SaaS | 3011 | http://localhost:3011 |

---

## Key Environment Variables

```env
# API
VITE_APP_API_BASE=http://localhost:8082/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
VITE_APP_BASE_URL=http://localhost:8081/

# Grafana
VITE_APP_GRAFANA_API_URL=https://grafana.cyoda.com/api
VITE_APP_GRAFANA_API_KEY=eyJrIjoiTWRnbVMxSHEyeUFvVEg5ODZsUzYzNTlKS2cwaEY3anQiLCJuIjoidGVzdCIsImlkIjoxfQ==

# Auth0
VITE_APP_AUTH0_DOMAIN=dev-ex6r-yqc.us.auth0.com
VITE_APP_AUTH0_CLIENT_ID=2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A
VITE_APP_AUTH0_AUDIENCE=https://cobi.cyoda.com/api

# Debug
VITE_APP_DEBUG=true
```

---

## Common Commands

### Start Development
```bash
cd react-project
npm run dev                    # All packages
cd packages/cobi-react && npm run dev  # Specific package
```

### Setup Environment
```bash
./connect-backend.sh           # Interactive
cd react-project && ./scripts/setup-env-from-template.sh local   # Local
cd react-project && ./scripts/setup-env-from-template.sh remote  # Remote
```

### Test Connection
```bash
./react-project/scripts/test-backend-connection.sh
curl http://localhost:8082/api
```

### Mock Server
```bash
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

---

## File Locations

### Templates
```
react-project/.env.template
react-project/packages/cobi-react/.env.template
react-project/packages/processing-manager-react/.env.template
```

### Generated Files (gitignored)
```
react-project/.env.development.local
react-project/packages/cobi-react/.env.development.local
react-project/packages/processing-manager-react/.env.development.local
```

### Scripts
```
./connect-backend.sh
./react-project/scripts/setup-env-from-template.sh
./react-project/scripts/setup-backend-connection.sh
./react-project/scripts/test-backend-connection.sh
```

---

## Troubleshooting

### Environment not loading?
```bash
# Restart dev server
npm run dev
```

### Wrong backend URL?
```bash
# Check config
cat react-project/packages/cobi-react/.env.development.local

# Re-run setup
cd react-project && ./scripts/setup-env-from-template.sh local
```

### Port already in use?
```bash
lsof -ti:3009 | xargs kill -9
```

### Backend not accessible?
```bash
# Use mock server
cd react-project/packages/tableau-react
node test-data/mock-server.mjs
```

---

## Documentation

- **START_HERE.md** - Quick start guide
- **ENV_TEMPLATE_SETUP_COMPLETE.md** - Template setup summary
- **ENV_SETUP_GUIDE.md** - Complete environment guide
- **BACKEND_CONNECTION_GUIDE.md** - Backend connection details
- **react-project/CONNECT_TO_BACKEND.md** - Quick reference

---

## Quick Decision Tree

**Do you have a Cyoda backend?**
- ❌ No → Use Mock Server (Option 1)
- ✅ Yes, Local → Setup Local (Option 2 or 4)
- ✅ Yes, Remote → Setup Remote (Option 3 or 4)

**Which setup method?**
- 🎯 Easiest → `./connect-backend.sh` (Option 4)
- ⚡ Fastest → Direct script: `./scripts/setup-env-from-template.sh local`
- 🔧 Custom → Manual: Copy `.env.template` and edit

---

## Most Common Workflow

```bash
# 1. Run interactive helper
./connect-backend.sh

# 2. Choose option 4 (Setup from Template)

# 3. Select preset (local or remote)

# 4. Confirm and start dev server

# 5. Open browser to http://localhost:3009
```

---

**Need help? Run:** `./connect-backend.sh` **and choose option 6 for info!**

