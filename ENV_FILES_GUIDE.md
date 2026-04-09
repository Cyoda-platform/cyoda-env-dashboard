# 📝 Environment Files Guide

## 🎯 Quick Answer: Which .env file should I use?

### For SaaS App Development (99% of cases):

**Use:** `apps/saas-app/.env` (already configured, no changes needed!)

```bash
# Just run the app - it works out of the box!
npm run dev
```

### For Standalone Package Development (rare):

**Use:** `.env.development.local.example` → copy to `.env.development.local`

---

## 📂 Environment Files Structure

```
cyoda-saas-platform/
│
├── .env.template                          # ⚠️  For standalone packages only
├── .env.development.local.example         # ⚠️  For standalone packages only
│
├── apps/saas-app/
│   ├── .env                              # ✅ MAIN CONFIG - Used by SaaS app
│   ├── .env.example                      # Template for SaaS app
│   └── .env.development.local            # ✅ Local overrides (feature flags)
│
└── packages/
    ├── cobi-react/
    │   ├── .env.template                 # For standalone mode
    │   └── .env.development.local        # For standalone mode
    ├── tableau-react/
    │   └── .env.development              # For standalone mode
    └── ... (other packages)
```

---

## 🚀 SaaS App Configuration

### Files Used by SaaS App:

#### 1. `apps/saas-app/.env` (Main Configuration)

**Status:** ✅ Already configured and committed to git

**Content:**
```bash
VITE_APP_API_BASE=/api
VITE_APP_API_BASE_PROCESSING=
VITE_APP_BASE_URL=https://cyoda-develop.kube3.cyoda.org/
VITE_APP_AUTH0_DOMAIN=dev-ex6r-yqc.us.auth0.com
VITE_APP_AUTH0_CLIENT_ID=2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A
# ... other settings
```

**Purpose:** Main configuration for SaaS app. Works with Vite proxy to connect to Cyoda backend.

**Action Required:** ❌ None - works out of the box!

#### 2. `apps/saas-app/.env.development.local` (Optional Overrides)

**Status:** ✅ In .gitignore (local only)

**Content:**
```bash
VITE_FEATURE_FLAG_USE_MODELS_INFO=true
```

**Purpose:** Local feature flags and developer-specific overrides.

**Action Required:** ❌ None - optional file for local customization

---

## ⚠️ Files NOT Used by SaaS App

### 1. `.env.template` (Root Directory)

**Status:** ⚠️ Template only - NOT used by SaaS app

**Purpose:** Template for standalone package development

**When to use:** Only when developing individual packages in isolation

**Example:**
```bash
# Developing tableau-react package standalone
cd packages/tableau-react
cp ../../.env.template .env.development.local
npm run dev  # Runs on port 3002
```

### 2. `.env.development.local.example` (Root Directory)

**Status:** ⚠️ Example only - NOT used by SaaS app

**Purpose:** Example configuration for standalone package development

**When to use:** Same as `.env.template` - only for standalone packages

---

## 🔍 How Vite Loads .env Files

### For SaaS App (`npm run dev`):

Vite looks for .env files in **`apps/saas-app/`** directory in this order:

1. `.env.development.local` (highest priority - local overrides)
2. `.env.local`
3. `.env.development`
4. `.env` (base configuration)

**❌ Vite does NOT load:**
- `.env.template` (root)
- `.env.development.local.example` (root)
- Any .env files from `packages/*`

### For Standalone Package (`npm run dev -w packages/tableau-react`):

Vite looks for .env files in **`packages/tableau-react/`** directory.

---

## 🎯 Common Scenarios

### Scenario 1: I'm a new developer, how do I start?

```bash
# 1. Install dependencies
yarn install

# 2. Run the app (no .env setup needed!)
npm run dev

# 3. Open browser
# http://localhost:3000
```

**No .env file creation needed!** Everything is already configured.

### Scenario 2: I want to change API endpoint

**Edit:** `apps/saas-app/.env`

```bash
# Change from remote to local backend
VITE_APP_API_BASE=http://localhost:8082/api
```

Then restart dev server:
```bash
npm run dev
```

### Scenario 3: I want to enable a feature flag

**Create/Edit:** `apps/saas-app/.env.development.local`

```bash
VITE_FEATURE_FLAG_CHATBOT=true
VITE_FEATURE_FLAG_USE_MODELS_INFO=true
```

This file is in `.gitignore`, so it won't be committed.

### Scenario 4: I'm developing a package standalone

```bash
# 1. Copy template
cp .env.development.local.example .env.development.local

# 2. Edit for your local backend
nano .env.development.local

# 3. Run package standalone
npm run dev -w packages/tableau-react
```

---

## 📊 Configuration Comparison

| File | Used By | Purpose | In Git? |
|------|---------|---------|---------|
| `apps/saas-app/.env` | SaaS App | Main config | ✅ Yes |
| `apps/saas-app/.env.example` | - | Template | ✅ Yes |
| `apps/saas-app/.env.development.local` | SaaS App | Local overrides | ❌ No (.gitignore) |
| `.env.template` | Standalone packages | Template | ✅ Yes |
| `.env.development.local.example` | Standalone packages | Example | ✅ Yes |
| `packages/*/.env.*` | Standalone packages | Package config | ⚠️ Mixed |

---

## 🐛 Troubleshooting

### Problem: My .env changes are not applied

**Solution:**
1. Make sure you're editing `apps/saas-app/.env` (not root `.env.template`)
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Problem: I see "API connection failed"

**Check:**
1. `apps/saas-app/.env` has correct values
2. Vite proxy is configured in `apps/saas-app/vite.config.ts`
3. Backend is accessible: `curl https://cyoda-develop.kube3.cyoda.org/api`

### Problem: I accidentally edited root `.env.template`

**Solution:**
```bash
# Restore from git
git checkout .env.template

# Edit the correct file instead
nano apps/saas-app/.env
```

---

## ✅ Best Practices

### DO:

✅ Edit `apps/saas-app/.env` for SaaS app configuration
✅ Use `apps/saas-app/.env.development.local` for local overrides
✅ Keep `.env.development.local` in `.gitignore`
✅ Document any required environment variables in `.env.example`

### DON'T:

❌ Don't edit root `.env.template` for SaaS app
❌ Don't commit `.env.development.local` files
❌ Don't use absolute paths in .env (use relative paths for Vite proxy)
❌ Don't store secrets in committed .env files

---

## 📚 Related Documentation

- **Quick Start:** `QUICK_START_NEW_USER.md`
- **SaaS App:** `apps/saas-app/README.md`
- **Ports:** `PORTS.md`

---

## 🎉 Summary

**For 99% of developers:**

Just run `npm run dev` - no .env setup needed!

The app is already configured to work with the Cyoda backend via Vite proxy.

**Only edit .env files if you need to:**
- Change API endpoints
- Enable/disable feature flags
- Develop packages in standalone mode

