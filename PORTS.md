# Development Server Ports

This document lists all development server ports used in the monorepo.

## 🚀 Applications

| Port | Application | Command | Description |
|------|-------------|---------|-------------|
| **3000** | **SaaS App** | `npm run dev:saas` | **Main SaaS application** (ALWAYS on port 3000) |

## 📦 Packages (Standalone Development)

| Port | Package | Command | Description |
|------|---------|---------|-------------|
| 3001 | COBI React | `npm run dev -w packages/cobi-react` | Data mapping and configuration |
| 3002 | Tableau React | `npm run dev -w packages/tableau-react` | Reporting and visualization |
| 3008 | Processing Manager | `npm run dev -w packages/processing-manager-react` | Processing management |
| 3010 | Tasks React | `npm run dev -w packages/tasks-react` | Task management |
| 3014 | State Machine React | `npm run dev -w packages/statemachine-react` | Workflow state machine |

## ⚠️ Important Rules

1. **Port 3000 is RESERVED for SaaS App ONLY**
   - Never change the SaaS app port
   - All other apps/packages must use different ports
   - This ensures `http://localhost:3000` always opens the main SaaS application

2. **Package Development**
   - Packages can be developed standalone on their assigned ports
   - Or integrated into SaaS app (recommended for most development)

3. **Port Conflicts**
   - If you see a port conflict, check this file
   - Make sure no two services use the same port
   - Update this file if you add new apps/packages

## 🔧 Configuration Files

Port configurations are defined in:
- `apps/saas-app/vite.config.ts` - Port 3000
- `packages/cobi-react/vite.config.ts` - Port 3001
- `packages/tableau-react/vite.config.ts` - Port 3002
- `packages/processing-manager-react/vite.config.ts` - Port 3008
- `packages/tasks-react/vite.config.ts` - Port 3010
- `packages/statemachine-react/vite.config.ts` - Port 3014

## 📝 Adding New Apps/Packages

When adding a new app or package:

1. Choose an unused port (check this file)
2. Update the `vite.config.ts` with the port
3. Add entry to this file
4. Commit changes

## 🎯 Quick Start

**To run the main SaaS application:**
```bash
npm run dev:saas
```

Then open: **http://localhost:3000**

