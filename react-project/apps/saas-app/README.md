# Cyoda SaaS Application

A comprehensive SaaS platform that integrates multiple Cyoda packages into a unified application with selective features.

## 📋 Overview

This application provides a complete platform with the following features:

### Included Features

1. **Trino SQL Schemas** - Database schema management
2. **Reporting** - Comprehensive reporting tools
   - Report config editor
   - Stream Reports
   - Catalog of aliases
3. **Lifecycle** - Workflow and instance management
   - Workflow management
   - Instance tracking
4. **Tasks** - Task management system
5. **Entity Viewer** - Entity relationship visualization
6. **Processing** - Processing node management
7. **Authentication** - Login/logout functionality
8. **Version Information** - Platform version tracking

### UI Features

- **Left Side Menu (LSM)** - Hierarchical navigation with all features
- **Entity Type Toggle** - Switch between Business and Technical entity types
- **Responsive Layout** - Modern, responsive design using Ant Design
- **Dark Theme Sidebar** - Professional dark-themed navigation

## 🏗️ Architecture

### Package Dependencies

This app integrates the following workspace packages:

- `@cyoda/ui-lib-react` - Shared UI components
- `@cyoda/http-api-react` - API utilities and hooks
- `@cyoda/cyoda-sass-react` - Trino SQL schema management
- `@cyoda/tableau-react` - Reporting features
- `@cyoda/statemachine-react` - Workflow and lifecycle management
- `@cyoda/tasks-react` - Task management
- `@cyoda/processing-manager-react` - Processing node management

### Excluded Packages

The following packages are **NOT** included to keep the bundle optimized:

- `@cyoda/cobi-react` - Data mapping features (not required)
- `@cyoda/source-configuration-react` - Source configuration (not required)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0

### Installation

From the root of the monorepo:

```bash
# Install all dependencies
npm install
```

### Development

```bash
# Run the SaaS app in development mode
npm run dev -w apps/saas-app

# Or from this directory
cd react-project/apps/saas-app
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

```bash
# Build only the SaaS app and its dependencies
npm run build:saas

# Or build just this app (requires dependencies to be built first)
npm run build -w apps/saas-app
```

## 📁 Project Structure

```
saas-app/
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx          # Main layout wrapper
│   │   ├── AppHeader.tsx          # Header with Entity Toggle
│   │   ├── LeftSideMenu.tsx       # Navigation menu
│   │   └── *.scss                 # Component styles
│   ├── pages/
│   │   └── Login.tsx              # Login page
│   ├── routes/
│   │   └── index.tsx              # Centralized routing
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts              # TypeScript definitions
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Features in Detail

### Navigation Menu

The Left Side Menu provides access to all features in the following order:

1. **Trino SQL schemas** - Database schema management
2. **Reporting** (expandable)
   - Report config editor
   - Stream Reports
   - Catalog of aliases
3. **Lifecycle** (expandable)
   - Workflow
   - Instances
4. **Tasks** - Task management
5. **Entity viewer** - Entity visualization
6. **Processing** - Processing nodes
7. **Logout** - User logout with data clearing option
8. **Version App** - Version information modal

### Entity Type Toggle

Located in the top-right header, allows switching between:
- **Business** entities
- **Technical** (Persistence) entities

This setting is persisted across sessions and affects entity filtering throughout the application.

### Routing

All routes are centralized in `src/routes/index.tsx` with lazy loading for optimal performance:

- `/trino` - Trino schema list
- `/trino/schema/:id` - Edit schema
- `/tableau/reports` - Report config editor
- `/tableau/reports/stream` - Stream reports
- `/tableau/catalogue-of-aliases` - Alias catalog
- `/workflows` - Workflow list
- `/instances` - Instance list
- `/tasks` - Task list
- `/entity-viewer` - Entity viewer
- `/processing-ui` - Processing dashboard

## 🔧 Configuration

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_APP_UI_VERSION=1.0.0
VITE_APP_UI_BUILD_TIME=2024-01-01T00:00:00Z
VITE_APP_UI_BRANCH_NAME=main
VITE_APP_API_BASE=http://localhost:8080
```

### API Proxy

The Vite dev server is configured to proxy API requests to `http://localhost:8080`:

- `/platform-api/*` → Backend API
- `/platform-processing/*` → Processing API
- `/api/*` → General API
- `/processing/*` → Processing endpoints

## 🎯 Build Optimization

### Code Splitting

The app uses React lazy loading and Vite's automatic code splitting to optimize bundle size:

- Each package is loaded on-demand
- Vendor libraries are split into separate chunks
- Route-based code splitting for better performance

### Bundle Analysis

To analyze the bundle size:

```bash
npm run build
npx vite-bundle-visualizer
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

### Docker Deployment (Example)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY dist/ ./
RUN npm install -g serve
CMD ["serve", "-s", ".", "-l", "3000"]
```

## 🤝 Contributing

This app is part of the Cyoda monorepo. Follow the monorepo contribution guidelines.

## 📄 License

Private - Cyoda

## 🔗 Related Documentation

- [Cyoda UI React Monorepo](../../README.md)
- [UI Library Documentation](../../packages/ui-lib-react/README.md)
- [HTTP API Documentation](../../packages/http-api-react/README.md)

