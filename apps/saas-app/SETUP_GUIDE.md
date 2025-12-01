# Cyoda SaaS App - Complete Setup Guide

## 📦 What's Included

This SaaS application integrates **7 core packages** into a unified platform:

| Package | Feature | Routes |
|---------|---------|--------|
| `@cyoda/cyoda-sass-react` | Trino SQL Schemas | `/trino/*` |
| `@cyoda/tableau-react` | Reporting (3 sub-features) | `/tableau/*` |
| `@cyoda/statemachine-react` | Lifecycle (Workflow + Instances) | `/workflows/*`, `/instances/*` |
| `@cyoda/tasks-react` | Tasks | `/tasks/*` |
| `@cyoda/http-api-react` | Entity Viewer + API | `/entity-viewer` |
| `@cyoda/processing-manager-react` | Processing | `/processing-ui/*` |
| `@cyoda/ui-lib-react` | Shared UI Components | N/A |

### ❌ Excluded Packages

- `@cyoda/cobi-react` - Data mapping (not needed)
- `@cyoda/source-configuration-react` - Source config (not needed)

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SaaS App (Port 3000)                 │
├─────────────────────────────────────────────────────────┤
│  AppLayout (Header + Left Side Menu + Content)         │
│  ├── AppHeader (Entity Type Toggle)                    │
│  ├── LeftSideMenu (Navigation)                         │
│  └── Content (Route-based components)                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    ┌───▼───┐      ┌─────▼─────┐    ┌─────▼─────┐
    │ Trino │      │ Reporting │    │ Lifecycle │
    └───────┘      └───────────┘    └───────────┘
        │                 │                 │
    ┌───▼───┐      ┌─────▼─────┐    ┌─────▼─────┐
    │ Tasks │      │  Entity   │    │Processing │
    └───────┘      │  Viewer   │    └───────────┘
                   └───────────┘
```

---

## 🛠️ Installation Steps

### Step 1: Prerequisites

Ensure you have:
- **Node.js** >= 22.0.0
- **npm** >= 10.0.0

Check versions:
```bash
node -v
npm -v
```

### Step 2: Install Dependencies

From the **monorepo root** (`react-project/`):

```bash
npm install
```

This installs dependencies for all packages and apps.

### Step 3: Build Dependencies (Optional for Dev)

For development, dependencies are resolved via workspace aliases, so building is optional.

For production or if you encounter issues:

```bash
npm run build:saas-deps
```

This builds the 7 required packages.

---

## 🚀 Running the App

### Development Mode

**Option 1: From Root (Recommended)**
```bash
npm run dev
```

**Option 2: From App Directory**
```bash
cd react-project/apps/saas-app
npm run dev
```

The app will start on **http://localhost:3000**

### Production Build

**Build Everything:**
```bash
npm run build:saas
```

This runs:
1. `build:saas-deps` - Builds all 7 required packages
2. `build -w apps/saas-app` - Builds the SaaS app

**Preview Production Build:**
```bash
cd react-project/apps/saas-app
npm run preview
```

---

## 🎨 UI Components

### 1. Left Side Menu (LSM)

The navigation menu includes (in order):

1. **Trino SQL schemas** 🗄️
2. **Reporting** 📊 (expandable)
   - Report config editor
   - Stream Reports
   - Catalog of aliases
3. **Lifecycle** 🔄 (expandable)
   - Workflow
   - Instances
4. **Tasks** ✅
5. **Entity viewer** 👁️
6. **Processing** ⚙️
7. **Logout** 🚪 (with data clear option)
8. **Version App** ℹ️

### 2. Entity Type Toggle

Located in the **top-right header**, allows switching between:
- **Business** entities (default)
- **Technical** (Persistence) entities

**Persistence:**
- Saved to localStorage
- Affects entity filtering across all features
- Uses `useGlobalUiSettingsStore` from `@cyoda/http-api-react`

### 3. Layout Structure

```
┌────────────────────────────────────────────────┐
│  Header (Logo + Entity Type Toggle)           │
├──────┬─────────────────────────────────────────┤
│      │                                         │
│ LSM  │         Content Area                    │
│      │    (Route-based components)             │
│      │                                         │
│      │                                         │
└──────┴─────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Available variables:

```env
# Version Info (displayed in Version App modal)
VITE_APP_UI_VERSION=1.0.0
VITE_APP_UI_BUILD_TIME=2024-01-01T00:00:00Z
VITE_APP_UI_BRANCH_NAME=main

# API Base URL
VITE_APP_API_BASE=http://localhost:8080
```

### Vite Configuration

The `vite.config.ts` includes:

**Proxy Configuration:**
```typescript
proxy: {
  '/platform-api': { target: 'http://localhost:8080' },
  '/platform-processing': { target: 'http://localhost:8080' },
  '/api': { target: 'http://localhost:8080' },
  '/processing': { target: 'http://localhost:8080' },
}
```

**Code Splitting:**
```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-antd': ['antd', '@ant-design/icons'],
  'vendor-query': ['@tanstack/react-query', 'axios', 'zustand'],
}
```

---

## 📂 File Structure

```
saas-app/
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx          # Main layout
│   │   ├── AppLayout.scss
│   │   ├── AppHeader.tsx          # Header with toggle
│   │   ├── AppHeader.scss
│   │   ├── LeftSideMenu.tsx       # Navigation
│   │   └── LeftSideMenu.scss
│   ├── pages/
│   │   ├── Login.tsx              # Login page
│   │   └── Login.scss
│   ├── routes/
│   │   └── index.tsx              # All routes
│   ├── App.tsx                    # App root
│   ├── App.scss
│   ├── main.tsx                   # Entry point
│   ├── main.scss
│   └── vite-env.d.ts              # Type definitions
├── public/
│   └── assets/
│       └── images/
│           └── cyoda-logo.png     # Logo
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── QUICK_START.md
└── SETUP_GUIDE.md (this file)
```

---

## 🧪 Testing

### Run Tests

```bash
# From root
npm test

# Specific to saas-app (when tests are added)
npm test -w apps/saas-app
```

### E2E Tests

```bash
npm run test:e2e
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build:saas
```

Output: `react-project/apps/saas-app/dist/`

### Deploy to Server

**Option 1: Static Hosting**
```bash
# Copy dist/ to your web server
scp -r dist/* user@server:/var/www/saas-app/
```

**Option 2: Docker**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY dist/ ./
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]
```

**Option 3: Nginx**
```nginx
server {
    listen 80;
    server_name saas.cyoda.com;
    root /var/www/saas-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /platform-api {
        proxy_pass http://backend:8080;
    }
}
```

---

## 🐛 Troubleshooting

### Issue: Import Errors

**Solution:** Build dependencies first
```bash
npm run build:saas-deps
```

### Issue: Port 3000 in Use

**Solution:** Change port in `vite.config.ts`
```typescript
server: { port: 3001 }
```

### Issue: API Connection Failed

**Checklist:**
- ✅ Backend running on port 8080?
- ✅ `.env` has correct `VITE_APP_API_BASE`?
- ✅ Proxy config in `vite.config.ts` correct?

### Issue: Entity Type Toggle Not Working

**Solution:** Check localStorage
```javascript
// In browser console
localStorage.getItem('cyoda_global_ui_settings')
```

### Issue: Routes Not Working

**Solution:** Check React Router setup
- Ensure `BrowserRouter` is wrapping routes
- Check for conflicting route definitions

---

## 📊 Performance Optimization

### Bundle Size

Current optimizations:
- ✅ Lazy loading for all route components
- ✅ Code splitting by vendor libraries
- ✅ Tree-shaking enabled
- ✅ Only 7 packages included (excludes COBI + source-config)

### Expected Bundle Sizes

- **Vendor chunks**: ~500KB (gzipped)
- **App code**: ~200KB (gzipped)
- **Total**: ~700KB (gzipped)

### Further Optimization

```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer
```

---

## 🔐 Security

### Authentication

Currently uses **mock authentication**. To integrate real auth:

1. Update `src/pages/Login.tsx`
2. Implement `useAuth` hook from `@cyoda/http-api-react`
3. Add protected route wrapper

### Environment Variables

**Never commit `.env` files!**

Use `.env.example` as template.

---

## 📚 Additional Resources

- [Main README](./README.md)
- [Quick Start Guide](./QUICK_START.md)
- [Monorepo Documentation](../../README.md)
- [Package Documentation](../../packages/)

---

## ✅ Checklist

Before deploying:

- [ ] All dependencies installed
- [ ] `.env` configured
- [ ] Backend API accessible
- [ ] Build successful (`npm run build:saas`)
- [ ] Preview tested (`npm run preview`)
- [ ] All routes working
- [ ] Entity Type Toggle working
- [ ] Login/Logout working
- [ ] Version info displaying correctly

---

## 🆘 Support

For issues or questions:
1. Check this guide
2. Review package-specific READMEs
3. Check browser console for errors
4. Review network tab for API issues

