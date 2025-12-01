# Quick Start Guide - Cyoda SaaS App

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

From the **root** of the monorepo:

```bash
npm install
```

### 2. Run the Development Server

```bash
# Option A: From the root (recommended)
npm run dev

# Option B: From the app directory
cd react-project/apps/saas-app
npm run dev
```

### 3. Open Your Browser

Navigate to: **http://localhost:3000**

Default login credentials (mock):
- Username: `admin`
- Password: `password`

---

## 📋 Available Features

Once logged in, you'll have access to:

### 1. Trino SQL Schemas
- Create and manage database schemas
- Add/edit tables and fields
- Import entity models

### 2. Reporting
- **Report Config Editor**: Create and manage reports
- **Stream Reports**: Real-time data streaming reports
- **Catalog of Aliases**: Manage report aliases

### 3. Lifecycle
- **Workflow**: Create and manage workflows
- **Instances**: Track workflow instances

### 4. Tasks
- View and manage tasks
- Task details and status tracking

### 5. Entity Viewer
- Visualize entity relationships
- Navigate entity hierarchies
- Toggle between Business/Technical views

### 6. Processing
- Monitor processing nodes
- View processing events
- Track transactions

---

## 🎨 UI Features

### Entity Type Toggle
Located in the **top-right corner** of the header:
- **Business** - Business entity view
- **Technical** - Technical/Persistence entity view

This setting persists across sessions.

### Left Side Menu
Hierarchical navigation with all features organized by category.

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to configure:
- API endpoints
- Version information
- Feature flags

### Backend Connection

The app expects a backend server at `http://localhost:8080` by default.

To change this, update `VITE_APP_API_BASE` in your `.env` file.

---

## 🏗️ Building for Production

### Build the App

```bash
# From root - builds dependencies + app
npm run build:saas

# Or just the app (requires deps built first)
npm run build -w apps/saas-app
```

### Preview Production Build

```bash
cd react-project/apps/saas-app
npm run preview
```

---

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, edit `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to any available port
  // ...
}
```

### Missing Dependencies

If you see import errors, rebuild the dependencies:

```bash
npm run build:saas-deps
```

### API Connection Issues

Check that:
1. Backend server is running on `http://localhost:8080`
2. `.env` file has correct `VITE_APP_API_BASE`
3. Proxy configuration in `vite.config.ts` is correct

---

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the [monorepo documentation](../../README.md)
- Check individual package READMEs for feature-specific docs

---

## 🆘 Need Help?

- Check the console for error messages
- Review the browser network tab for API issues
- Ensure all dependencies are installed
- Try clearing `node_modules` and reinstalling

```bash
npm run clean
npm install
```

