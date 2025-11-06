# ✅ Environment Template Setup Complete

## 🎉 What's Been Created

I've created a comprehensive environment configuration system with templates for your Cyoda backend connections!

### 📁 Template Files Created

1. **Root Template**
   - `react-project/.env.template` - Main configuration template

2. **Package Templates**
   - `react-project/packages/cobi-react/.env.template`
   - `react-project/packages/processing-manager-react/.env.template`

### 🔧 Setup Scripts

1. **Template-Based Setup**
   - `react-project/scripts/setup-env-from-template.sh`
   - Automatically creates `.env.development.local` from templates
   - Supports presets: local, remote, custom

2. **Updated Connection Helper**
   - `./connect-backend.sh` - Now includes template setup option

### 📖 Documentation

- **ENV_SETUP_GUIDE.md** - Complete environment setup guide
- Updated **BACKEND_CONNECTION_GUIDE.md**
- Updated **connect-backend.sh** with new options

---

## 🎯 Configuration Presets

### Local Development
```env
VITE_APP_API_BASE=http://localhost:8082/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
VITE_APP_BASE_URL=http://localhost:8081/
```

### Remote Development (cyoda-develop)
```env
VITE_APP_API_BASE=https://cyoda-develop.kube.cyoda.org/api
VITE_APP_API_BASE_PROCESSING=https://cyoda-develop.kube.cyoda.org/processing
VITE_APP_BASE_URL=https://cyoda-develop.kube.cyoda.org
```

### Additional Configuration
```env
# Grafana
VITE_APP_GRAFANA_API_URL=https://grafana.cyoda.com/api
VITE_APP_GRAFANA_API_KEY=eyJrIjoiTWRnbVMxSHEyeUFvVEg5ODZsUzYzNTlKS2cwaEY3anQiLCJuIjoidGVzdCIsImlkIjoxfQ==
VITE_APP_GRAFANA_SERVER_SOURCE_ID=1

# Auth0
VITE_APP_AUTH0_DOMAIN=dev-ex6r-yqc.us.auth0.com
VITE_APP_AUTH0_CLIENT_ID=2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A
VITE_APP_AUTH0_AUDIENCE=https://cobi.cyoda.com/api
VITE_APP_AUTH0_REDIRECT_URI=https://cobi.cyoda.com

# Debug
VITE_APP_DEBUG=true
```

---

## 🚀 How to Use

### Method 1: Interactive Helper (Easiest!)

```bash
./connect-backend.sh
```

Choose option 4: "🔧 Setup from Template (recommended)"

### Method 2: Direct Script

```bash
cd react-project

# For local development (localhost:8082/8081)
./scripts/setup-env-from-template.sh local

# For remote development (cyoda-develop)
./scripts/setup-env-from-template.sh remote

# For custom configuration
./scripts/setup-env-from-template.sh custom
```

### Method 3: Manual Setup

```bash
# Copy template
cd react-project/packages/cobi-react
cp .env.template .env.development.local

# Edit the file
nano .env.development.local

# Start dev server
npm run dev
```

---

## 📊 What Gets Configured

### Packages Configured

✅ **cobi-react** - Main COBI application
✅ **processing-manager-react** - Processing Manager
✅ **Root directory** - Global configuration

### Environment Variables Set

✅ API endpoints (main and processing)
✅ Base URL configuration
✅ Grafana integration
✅ Auth0 authentication
✅ Debug settings
✅ Feature flags (optional)

---

## 🎨 Updated Connection Helper

The `./connect-backend.sh` script now has 7 options:

1. 🚀 Use Mock Server (fastest - no backend needed)
2. 🏠 Connect to Local Backend (localhost:8082/8081)
3. 🌐 Connect to Remote Backend (cyoda-develop)
4. **🔧 Setup from Template (recommended)** ← NEW!
5. 🧪 Test Backend Connection
6. ℹ️  Show Connection Info
7. ❌ Exit

---

## 🔑 Key Features

### Template System
- ✅ Centralized configuration templates
- ✅ Easy to maintain and update
- ✅ Consistent across packages
- ✅ Version controlled (templates only)

### Preset Support
- ✅ Local development preset
- ✅ Remote development preset
- ✅ Custom configuration option

### Automated Setup
- ✅ One command to configure all packages
- ✅ Automatic URL substitution
- ✅ Interactive prompts
- ✅ Validation and confirmation

### Documentation
- ✅ Complete environment variable reference
- ✅ Troubleshooting guide
- ✅ Step-by-step instructions
- ✅ Examples for all scenarios

---

## 📋 Environment Variables Reference

### Core API Configuration
| Variable | Local | Remote |
|----------|-------|--------|
| `VITE_APP_API_BASE` | `http://localhost:8082/api` | `https://cyoda-develop.kube.cyoda.org/api` |
| `VITE_APP_API_BASE_PROCESSING` | `http://localhost:8081/processing` | `https://cyoda-develop.kube.cyoda.org/processing` |
| `VITE_APP_BASE_URL` | `http://localhost:8081/` | `https://cyoda-develop.kube.cyoda.org` |

### Grafana (Same for both)
- `VITE_APP_GRAFANA_API_URL`
- `VITE_APP_GRAFANA_API_KEY`
- `VITE_APP_GRAFANA_SERVER_SOURCE_ID`

### Auth0 (Same for both)
- `VITE_APP_AUTH0_DOMAIN`
- `VITE_APP_AUTH0_CLIENT_ID`
- `VITE_APP_AUTH0_AUDIENCE`
- `VITE_APP_AUTH0_REDIRECT_URI`

---

## 🎬 Quick Start Examples

### Example 1: Local Development

```bash
# Setup for local backend
cd react-project
./scripts/setup-env-from-template.sh local

# Start COBI
cd packages/cobi-react
npm run dev

# Visit: http://localhost:3009
```

### Example 2: Remote Development

```bash
# Setup for remote backend
cd react-project
./scripts/setup-env-from-template.sh remote

# Start all packages
npm run dev
```

### Example 3: Interactive Setup

```bash
# Run interactive helper
./connect-backend.sh

# Choose option 4 (Setup from Template)
# Select preset (local or remote)
# Confirm and start dev server
```

---

## 🐛 Troubleshooting

### Environment Not Loading
```bash
# Restart dev server
# Environment variables are loaded at build time
npm run dev
```

### Wrong Backend URL
```bash
# Check your .env.development.local file
cat react-project/packages/cobi-react/.env.development.local

# Re-run setup if needed
cd react-project
./scripts/setup-env-from-template.sh local
```

### Template Not Found
```bash
# Ensure you're in the project root
pwd  # Should show: /Users/Victoria/PycharmProjects/test-project-saas

# Run from correct location
./connect-backend.sh
```

---

## 📚 Documentation Files

1. **ENV_SETUP_GUIDE.md** - Complete environment setup guide
2. **BACKEND_CONNECTION_GUIDE.md** - Backend connection details
3. **BACKEND_CONNECTION_SETUP_COMPLETE.md** - Original setup summary
4. **START_HERE.md** - Quick start guide
5. **react-project/CONNECT_TO_BACKEND.md** - Quick reference

---

## 🎯 Next Steps

### 1. Choose Your Environment

Decide whether you want to connect to:
- Local backend (localhost:8082/8081)
- Remote backend (cyoda-develop.kube.cyoda.org)

### 2. Run Setup

```bash
./connect-backend.sh
```

Choose option 4 and select your preset.

### 3. Start Development

```bash
cd react-project
npm run dev
```

### 4. Access Applications

- COBI: http://localhost:3009
- Processing Manager: http://localhost:3008
- Tableau: http://localhost:3007
- And more...

---

## ✨ Summary

You now have:

✅ **Template files** for all packages
✅ **Automated setup scripts** with presets
✅ **Updated connection helper** with template option
✅ **Complete documentation** for all scenarios
✅ **Two backend configurations** ready to use
✅ **Grafana & Auth0** pre-configured

**Everything is ready to connect to your Cyoda backend!**

---

## 🚀 Ready to Start?

Run this command:

```bash
./connect-backend.sh
```

Choose option 4 (Setup from Template) and you're all set! 🎉

