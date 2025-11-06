# 🔧 Environment Setup Guide

## Overview

This guide explains how to configure the Cyoda React applications using the `.env.template` files.

## 📋 Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
./connect-backend.sh
```

Choose option 4 (Setup from Template) and follow the prompts.

### Option 2: Command Line Setup

```bash
cd react-project

# For local development
./scripts/setup-env-from-template.sh local

# For remote development (cyoda-develop)
./scripts/setup-env-from-template.sh remote

# For custom configuration
./scripts/setup-env-from-template.sh custom
```

---

## 🎯 Configuration Presets

### Local Development

**Backend URLs:**
- API: `http://localhost:8082/api`
- Processing: `http://localhost:8081/processing`
- Base URL: `http://localhost:8081/`

**Use when:**
- Running Cyoda backend locally
- Development and testing
- Debugging backend issues

**Setup:**
```bash
cd react-project
./scripts/setup-env-from-template.sh local
```

### Remote Development (cyoda-develop)

**Backend URLs:**
- API: `https://cyoda-develop.kube.cyoda.org/api`
- Processing: `https://cyoda-develop.kube.cyoda.org/processing`
- Base URL: `https://cyoda-develop.kube.cyoda.org`

**Use when:**
- Connecting to shared development environment
- Testing with production-like data
- Collaborating with team

**Setup:**
```bash
cd react-project
./scripts/setup-env-from-template.sh remote
```

---

## 📁 Environment Files

### Template Files

Templates are located in:
- `react-project/.env.template` - Root template
- `react-project/packages/cobi-react/.env.template` - COBI package
- `react-project/packages/processing-manager-react/.env.template` - Processing Manager

### Generated Files

After running setup, these files are created:
- `react-project/.env.development.local`
- `react-project/packages/cobi-react/.env.development.local`
- `react-project/packages/processing-manager-react/.env.development.local`

**Note:** `.env.development.local` files are gitignored and won't be committed.

---

## 🔑 Environment Variables Reference

### API Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_API_BASE` | Main API endpoint | `http://localhost:8082/api` |
| `VITE_APP_API_BASE_PROCESSING` | Processing API endpoint | `http://localhost:8081/processing` |
| `VITE_APP_BASE_URL` | Application base URL | `http://localhost:8081/` |

### Grafana Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_GRAFANA_API_URL` | Grafana API URL | `https://grafana.cyoda.com/api` |
| `VITE_APP_GRAFANA_API_KEY` | Grafana API key | `eyJrIjoiTWRnbVMx...` |
| `VITE_APP_GRAFANA_SERVER_SOURCE_ID` | Grafana server source ID | `1` |
| `VITE_APP_GRAFANA_USERNAME` | Grafana username (optional) | - |
| `VITE_APP_GRAFANA_PASSWORD` | Grafana password (optional) | - |

### Auth0 Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_AUTH0_DOMAIN` | Auth0 domain | `dev-ex6r-yqc.us.auth0.com` |
| `VITE_APP_AUTH0_CLIENT_ID` | Auth0 client ID | `2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A` |
| `VITE_APP_AUTH0_AUDIENCE` | Auth0 audience | `https://cobi.cyoda.com/api` |
| `VITE_APP_AUTH0_REDIRECT_URI` | Auth0 redirect URI | `https://cobi.cyoda.com` |
| `VITE_APP_AUTH0_ORGANIZATION` | Auth0 organization (optional) | - |

### Debug & Features

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_DEBUG` | Enable debug mode | `true` |
| `VITE_FEATURE_FLAG_CHATBOT` | Enable ChatBot feature | `false` |
| `VITE_FEATURE_FLAG_USE_MODELS_INFO` | Enable Models Info | `false` |

### AI Configuration (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_AI_BASE` | AI API base URL | - |

### Deployment (Production Only)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_PUBLIC_PATH` | Public path for deployment | `/` |
| `VITE_APP_PUBLIC_PATH` | Alternative public path | `/` |

---

## 🛠️ Manual Configuration

### Step 1: Copy Template

```bash
cd react-project/packages/cobi-react
cp .env.template .env.development.local
```

### Step 2: Edit Configuration

Open `.env.development.local` and modify the values:

```env
# For local development
VITE_APP_API_BASE=http://localhost:8082/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
VITE_APP_BASE_URL=http://localhost:8081/

# For remote development
# VITE_APP_API_BASE=https://cyoda-develop.kube.cyoda.org/api
# VITE_APP_API_BASE_PROCESSING=https://cyoda-develop.kube.cyoda.org/processing
# VITE_APP_BASE_URL=https://cyoda-develop.kube.cyoda.org
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

---

## 🔄 Switching Between Environments

### From Local to Remote

```bash
cd react-project
./scripts/setup-env-from-template.sh remote
npm run dev
```

### From Remote to Local

```bash
cd react-project
./scripts/setup-env-from-template.sh local
npm run dev
```

---

## 🧪 Testing Configuration

### Verify Environment Variables

Create a test file to check loaded variables:

```typescript
// test-env.ts
console.log('API Base:', import.meta.env.VITE_APP_API_BASE);
console.log('Processing Base:', import.meta.env.VITE_APP_API_BASE_PROCESSING);
console.log('Base URL:', import.meta.env.VITE_APP_BASE_URL);
console.log('Debug:', import.meta.env.VITE_APP_DEBUG);
```

### Test Backend Connection

```bash
# Test local backend
curl http://localhost:8082/api

# Test remote backend
curl https://cyoda-develop.kube.cyoda.org/api
```

---

## 🐛 Troubleshooting

### Environment Variables Not Loading

**Problem:** Changes to `.env.development.local` not reflected

**Solution:**
1. Restart the dev server
2. Clear browser cache
3. Check file is named exactly `.env.development.local`
4. Verify file is in the correct package directory

### Wrong Backend URL

**Problem:** API calls going to wrong endpoint

**Solution:**
1. Check `.env.development.local` has correct URLs
2. Restart dev server
3. Check browser console for actual URLs being used
4. Verify no other `.env` files are overriding values

### CORS Errors

**Problem:** CORS policy errors in browser

**Solution:**
1. Vite proxy is configured in `vite.config.ts`
2. Backend must allow CORS from frontend origin
3. Check backend CORS configuration

### Template Not Found

**Problem:** `setup-env-from-template.sh` can't find template

**Solution:**
1. Ensure you're in the `react-project` directory
2. Check `.env.template` files exist
3. Run from project root: `./scripts/setup-env-from-template.sh`

---

## 📚 Additional Resources

- [Backend Connection Guide](BACKEND_CONNECTION_GUIDE.md)
- [Quick Start Guide](react-project/CONNECT_TO_BACKEND.md)
- [Main README](react-project/README.md)

---

## 🎯 Summary

✅ **Template files created** - `.env.template` in root and packages
✅ **Setup scripts ready** - Automated configuration
✅ **Multiple presets** - Local, remote, and custom
✅ **Complete documentation** - All variables explained

**Ready to start?**

```bash
./connect-backend.sh
```

Choose option 4 (Setup from Template) and you're good to go! 🚀

