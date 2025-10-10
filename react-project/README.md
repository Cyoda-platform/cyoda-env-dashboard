# Cyoda UI React

React-based monorepo migrated from Vue 3. This project contains multiple packages for the Cyoda UI application.

## Prerequisites

- Node.js >= 22.0.0
- Yarn >= 4.6.0

Check your Node.js version:
```bash
node -v
```

## Installation

### 1. Enable Corepack (if not already enabled)
```bash
corepack enable
```

### 2. Install Dependencies
```bash
yarn install
```

This will install all dependencies and bootstrap the monorepo.

## Project Structure

```
react-project/
├── packages/
│   ├── ui-lib-react/          # Shared UI component library
│   ├── http-api-react/        # HTTP API utilities
│   ├── cobi-react/            # Main COBI application
│   ├── tasks-react/           # Tasks module
│   ├── processing-manager-react/
│   ├── source-configuration-react/
│   ├── statemachine-react/
│   ├── tableau-react/
│   └── cyoda-sass-react/      # SaaS application
├── scripts/                   # Build and utility scripts
├── package.json              # Root workspace configuration
└── README.md
```

## Development

### Run all packages in development mode
```bash
yarn dev
```

### Run a specific package
```bash
yarn workspace @cyoda/ui-lib-react dev
```

### Build all packages
```bash
yarn build
```

### Run tests
```bash
yarn test
```

### Lint code
```bash
yarn lint
```

### Type checking
```bash
yarn type-check
```

### Format code
```bash
yarn format
```

## Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.11
- **Language**: TypeScript 5.7.3
- **State Management**: Redux Toolkit / Zustand
- **Routing**: React Router v6
- **UI Library**: Ant Design / Material-UI
- **Testing**: Vitest, React Testing Library, Cypress
- **Package Manager**: Yarn 4.6.0 (workspaces)

## Migration Status

This project is being migrated from Vue 3. See [MIGRATION_PROGRESS.md](../MIGRATION_PROGRESS.md) for current status.

## Package Overview

### Core Packages

- **@cyoda/ui-lib-react**: Shared UI components and utilities
- **@cyoda/http-api-react**: HTTP client and API utilities

### Application Packages

- **@cyoda/cobi-react**: Main COBI application
- **@cyoda/cyoda-sass-react**: SaaS application
- **@cyoda/tasks-react**: Task management module
- **@cyoda/processing-manager-react**: Processing manager
- **@cyoda/source-configuration-react**: Source configuration
- **@cyoda/statemachine-react**: State machine module
- **@cyoda/tableau-react**: Tableau integration

## Contributing

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

## Troubleshooting

### Yarn installation issues
```bash
corepack enable
corepack prepare yarn@4.6.0 --activate
```

### Clear all caches
```bash
yarn clean
rm -rf .yarn/cache
yarn install
```

### Type errors
```bash
yarn type-check
```

## License

Private - Cyoda

## Support

For issues and questions, contact the development team.

