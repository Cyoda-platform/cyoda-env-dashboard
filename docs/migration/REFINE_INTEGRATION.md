# Refine Integration Guide

## Overview

This document describes the integration of **Refine** framework into the Cyoda SaaS Application. Refine is a headless React framework for building enterprise-grade admin panels, dashboards, and internal tools.

## What is Refine?

Refine is an open-source, headless React framework that provides:
- **Headless Architecture**: Works with any UI library (Ant Design, Material-UI, Chakra UI, etc.)
- **Backend Agnostic**: Supports REST, GraphQL, SOAP APIs
- **Built-in Features**: Authentication, authorization, routing, state management
- **Enterprise Ready**: TypeScript support, SSR, i18n, accessibility

## Installation

### Step 1: Install Dependencies

The following packages have been added to `apps/saas-app/package.json`:

```json
{
  "dependencies": {
    "@refinedev/core": "^4.54.0",
    "@refinedev/antd": "^5.43.0",
    "@refinedev/kbar": "^1.3.0",
    "@refinedev/react-router-v6": "^4.6.0",
    "@refinedev/react-table": "^5.7.0",
    "@tanstack/react-table": "^8.20.5"
  }
}
```

To install these dependencies, run from the `react-project` directory:

```bash
# If using npm
npm install

# If using yarn (recommended for this workspace)
yarn install
```

**Note**: This project uses Yarn workspaces. If you encounter issues with Yarn version, you may need to enable Corepack:

```bash
corepack enable
```

### Step 2: Import Refine Styles

The Refine Ant Design styles are imported in `src/App.tsx`:

```typescript
import '@refinedev/antd/dist/reset.css';
```

## Architecture Changes

### 1. App.tsx - Refine Provider Setup

The main `App.tsx` now wraps the application with Refine providers:

```typescript
<Refine
  dataProvider={dataProvider}
  authProvider={authProvider}
  routerProvider={routerBindings}
  notificationProvider={useNotificationProvider}
  options={{
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
    useNewQueryKeys: true,
    projectId: 'cyoda-saas-app',
  }}
  resources={[...]}
>
  {/* App content */}
</Refine>
```

**Key Features**:
- **dataProvider**: Handles all API calls (CRUD operations)
- **authProvider**: Manages authentication and authorization
- **routerProvider**: Integrates with React Router v6
- **notificationProvider**: Displays notifications using Ant Design
- **resources**: Defines the application's resources/pages

### 2. Data Provider

Location: `src/providers/dataProvider.ts`

The data provider handles all API communication:

```typescript
const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {...},
  getOne: async ({ resource, id }) => {...},
  create: async ({ resource, variables }) => {...},
  update: async ({ resource, id, variables }) => {...},
  deleteOne: async ({ resource, id }) => {...},
  getApiUrl: () => API_URL,
  custom: async ({ url, method, payload }) => {...},
};
```

**Features**:
- Axios-based HTTP client
- Automatic authentication token injection
- Support for pagination, filtering, and sorting
- Custom endpoint support

### 3. Auth Provider

Location: `src/providers/authProvider.ts`

The auth provider manages user authentication:

```typescript
const authProvider: AuthProvider = {
  login: async ({ username, password }) => {...},
  logout: async () => {...},
  check: async () => {...},
  getPermissions: async () => {...},
  getIdentity: async () => {...},
  onError: async (error) => {...},
};
```

**Features**:
- Mock authentication (replace with real API)
- Token-based authentication
- Permission management
- Error handling with automatic logout on 401/403

### 4. Refine Layout

Location: `src/components/RefineLayout.tsx`

Custom layout component using Refine's ThemedLayoutV2:

```typescript
<ThemedLayoutV2
  Header={() => <CustomHeader />}
  Title={({ collapsed }) => <CustomTitle collapsed={collapsed} />}
  Sider={(props) => <ThemedSiderV2 {...props} />}
>
  {children}
</ThemedLayoutV2>
```

**Features**:
- Custom header with Cyoda logo and Entity Type switcher
- Collapsible sidebar
- Automatic menu generation from resources
- Responsive design

### 5. Login Page

Location: `src/pages/Login.tsx`

Uses Refine's AuthPage component:

```typescript
<AuthPage
  type="login"
  title={<AppLogo size="l" />}
  formProps={{
    initialValues: {
      email: 'demo@cyoda.com',
      password: 'demo',
    },
  }}
/>
```

## Resources Configuration

Resources are defined in `App.tsx` and automatically generate menu items:

```typescript
resources={[
  {
    name: 'trino',
    list: '/trino',
    meta: {
      label: 'Trino SQL schemas',
      icon: '🗄️',
    },
  },
  {
    name: 'workflows',
    list: '/workflows',
    meta: {
      label: 'Workflows',
      icon: '🔄',
      parent: 'lifecycle',
    },
  },
  // ... more resources
]}
```

**Resource Properties**:
- `name`: Unique identifier
- `list`: List page route
- `create`: Create page route (optional)
- `edit`: Edit page route (optional)
- `show`: Detail page route (optional)
- `meta.label`: Display name in menu
- `meta.icon`: Icon in menu
- `meta.parent`: Parent resource for nested menus

## Features Enabled

### 1. Command Palette (Kbar)

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette for quick navigation.

### 2. Unsaved Changes Warning

Automatically warns users when leaving a page with unsaved changes.

### 3. Document Title Handler

Automatically updates the browser tab title based on the current page.

### 4. Breadcrumbs

Automatic breadcrumb navigation based on the current route.

### 5. Responsive Sidebar

Collapsible sidebar that adapts to screen size.

## Customization

### Theming

Update the Ant Design theme in `App.tsx`:

```typescript
const theme = {
  token: {
    colorPrimary: '#148751', // Cyoda green
    borderRadius: 4,
  },
};
```

### Custom Header

Modify `src/components/RefineLayout.tsx` to customize the header:

```typescript
const CustomHeader: React.FC = () => {
  return (
    <ThemedHeaderV2 sticky>
      {/* Your custom header content */}
    </ThemedHeaderV2>
  );
};
```

### Custom Sidebar

Modify the sidebar by passing custom props to `ThemedSiderV2`:

```typescript
<ThemedSiderV2
  {...props}
  render={({ items, logout }) => {
    return (
      <>
        {items}
        {/* Custom menu items */}
        {logout}
      </>
    );
  }}
/>
```

## Migration from Old Layout

### Before (Old AppLayout)

```typescript
<Layout className="saas-app-layout">
  <AppHeader />
  <Layout hasSider>
    <LeftSideMenu />
    <Layout style={{ marginLeft: 250, marginTop: 64 }}>
      <Content className="saas-app-content">
        <Outlet />
      </Content>
    </Layout>
  </Layout>
</Layout>
```

### After (Refine Layout)

```typescript
<ThemedLayoutV2
  Header={() => <CustomHeader />}
  Title={({ collapsed }) => <CustomTitle collapsed={collapsed} />}
  Sider={(props) => <ThemedSiderV2 {...props} />}
>
  <Outlet />
</ThemedLayoutV2>
```

**Benefits**:
- Automatic menu generation from resources
- Built-in responsive behavior
- Consistent styling across the app
- Less custom code to maintain

## Next Steps

1. **Install Dependencies**: Run `yarn install` or `npm install`
2. **Start Development Server**: Run `npm run dev:saas`
3. **Test Login**: Navigate to `/login` and use demo credentials
4. **Explore Features**: Try the command palette (Ctrl+K), sidebar navigation, etc.

## Troubleshooting

### Issue: Yarn version mismatch

**Solution**: Enable Corepack
```bash
corepack enable
```

### Issue: Module not found errors

**Solution**: Ensure all dependencies are installed
```bash
yarn install
# or
npm install
```

### Issue: Styles not loading

**Solution**: Ensure `@refinedev/antd/dist/reset.css` is imported in `App.tsx`

## Resources

- **Refine Documentation**: https://refine.dev/docs/
- **Refine Examples**: https://refine.dev/examples/
- **Refine GitHub**: https://github.com/refinedev/refine
- **Ant Design**: https://ant.design/
- **React Router**: https://reactrouter.com/

## Support

For issues or questions about Refine integration, refer to:
- Refine Discord: https://discord.gg/refine
- Refine GitHub Issues: https://github.com/refinedev/refine/issues

