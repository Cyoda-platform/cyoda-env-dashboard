# Cyoda SaaS Platform

Modern React-based SaaS platform built as a monorepo with modular architecture.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22.0.0
- **Yarn** >= 4.6.0

Check your Node.js version:
```bash
node -v
```

### Installation

1. **Enable Corepack** (if not already enabled):
```bash
corepack enable
```

2. **Install Dependencies**:
```bash
yarn install
```

### Development

Run the main SaaS application:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
cyoda-saas-platform/
├── apps/
│   └── saas-app/              # 🎯 Main SaaS Application
│       ├── src/
│       │   ├── components/    # Layout components
│       │   ├── pages/         # Page components
│       │   ├── routes/        # Route configuration
│       │   └── App.tsx        # Root component
│       ├── package.json
│       └── vite.config.ts
│
├── packages/                  # 📦 Shared Packages
│   ├── ui-lib-react/         # Shared UI components
│   ├── http-api-react/       # HTTP API utilities
│   ├── cyoda-sass-react/     # Trino SQL schemas
│   ├── tableau-react/        # Reporting features
│   ├── statemachine-react/   # Workflow & lifecycle
│   ├── tasks-react/          # Task management
│   ├── processing-manager-react/  # Processing nodes
│   ├── cobi-react/           # Data mapping (optional)
│   └── source-configuration-react/  # Source config (optional)
│
├── docs/                      # 📚 Documentation
│   ├── migration/            # Migration documentation
│   └── guides/               # User guides
│
├── tools/                     # 🛠️ Development Tools
│   ├── backend-mock-server/  # Mock backend for testing
│   ├── test-screenshots/     # Test artifacts
│   └── *.mjs                 # Test scripts
│
├── scripts/                   # 🔧 Build & Deploy Scripts
├── e2e/                      # 🧪 E2E Tests
├── package.json              # Root workspace config
├── playwright.config.ts      # E2E test config
└── vitest.config.ts          # Unit test config
```

## 🎯 Main Application: SaaS App

The **`apps/saas-app`** is the primary application that integrates all packages.

### Features

- ✅ **Trino SQL Schemas** - Database schema management
- ✅ **Tableau Reports** - Report configuration and streaming
- ✅ **Workflow Management** - State machine and lifecycle
- ✅ **Task Management** - Task tracking and assignment
- ✅ **Entity Viewer** - Data visualization
- ✅ **Processing Manager** - Node and queue management
- ✅ **Authentication** - Auth0 integration
- ✅ **Dark Theme** - Modern CYODA AI Assistant theme

### Quick Commands

```bash
# Development
npm run dev

# Build
npm run build:saas

# Tests
npm run test:e2e
npm run test:e2e:ui

# Type checking
npm run type-check
```

## 📦 Packages Overview

### Core Libraries

- **`ui-lib-react`** - Shared UI components and utilities
- **`http-api-react`** - HTTP client, API hooks, and Entity Viewer

### Feature Modules

- **`cyoda-sass-react`** - Trino SQL schema management
- **`tableau-react`** - Reporting and data visualization
- **`statemachine-react`** - Workflow and state machine
- **`tasks-react`** - Task management
- **`processing-manager-react`** - Processing node management

### Optional Modules

- **`cobi-react`** - Data mapping (not included in SaaS app)
- **`source-configuration-react`** - Source configuration (not included in SaaS app)

## 🔨 Development

### Run SaaS App (Default)

```bash
npm run dev
```

### Run All Packages (if needed)

```bash
npm run dev:all
```

### Run Specific Package

```bash
npm run dev -w packages/tableau-react
```

### Build All Packages

```bash
npm run build
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Format
npm run format
```

## 🌐 Backend Connection

The SaaS app connects to the Cyoda backend via proxy configuration in `vite.config.ts`:

- **Platform API**: `https://cyoda-develop.kube3.cyoda.org`
- **Processing API**: `https://cyoda-develop.kube3.cyoda.org/api`

For local development with mock backend:
```bash
cd tools/backend-mock-server
npm install
npm start
```

## 📚 Documentation

- **User Guides**: `docs/guides/` - Setup and usage guides
- **Package READMEs**: Each package has its own README with specific documentation
- **SaaS App Docs**: `apps/saas-app/` - Main application documentation and quick start guides

## 🧪 Testing

### E2E Tests

E2E tests are located in `e2e/` directory and use Playwright.

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

### Unit Tests

Unit tests use Vitest and are located in each package.

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 🔧 Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.11
- **Language**: TypeScript 5.7.3
- **State Management**: Zustand
- **Routing**: React Router v6
- **UI Library**: Ant Design
- **Testing**: Vitest, Playwright, React Testing Library
- **Package Manager**: Yarn 4.6.0 (workspaces)

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Run SaaS app (default) |
| `npm run dev:all` | Run all packages in dev mode |
| `npm run dev:saas` | Run SaaS app only (same as `dev`) |
| `npm run build` | Build all packages |
| `npm run build:saas` | Build SaaS app and dependencies |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Lint all packages |
| `npm run type-check` | Type check all packages |
| `npm run clean` | Clean all node_modules |
| `npm run format` | Format code with Prettier |

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components (no class components)
- Write tests for all new features
- Follow the existing project structure

### Commit Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

## 🐛 Troubleshooting

### Yarn installation issues
```bash
corepack enable
corepack prepare yarn@4.6.0 --activate
```

### Clear all caches
```bash
npm run clean
rm -rf .yarn/cache
yarn install
```

### Type errors
```bash
npm run type-check
```

## 📄 License

Private - Cyoda

## 💬 Support

For issues and questions, contact the development team.