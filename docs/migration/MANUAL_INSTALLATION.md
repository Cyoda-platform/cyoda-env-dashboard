# Manual Installation Guide for Refine

## Issue

The automatic installation script may fail due to Yarn version mismatch or npm not supporting the `workspace:` protocol used in this monorepo.

## Solution Options

### Option 1: Enable Corepack (Recommended)

Corepack is included with Node.js 16.9+ and manages package manager versions automatically.

```bash
# Enable Corepack
corepack enable

# Verify it's working
corepack prepare yarn@4.6.0 --activate

# Now install dependencies
cd react-project
yarn install
```

### Option 2: Use Yarn 4 Directly

If Corepack doesn't work, install Yarn 4 manually:

```bash
# Install Yarn 4 globally
npm install -g yarn@4.6.0

# Verify version
yarn --version  # Should show 4.6.0

# Install dependencies
cd react-project
yarn install
```

### Option 3: Manual Package Installation

If the above options don't work, you can manually add the packages:

```bash
cd react-project

# Using Yarn (if available)
yarn workspace @cyoda/saas-app add @refinedev/core @refinedev/antd @refinedev/kbar @refinedev/react-router-v6 @refinedev/react-table @tanstack/react-table

# OR using npm with workspace flag (Node 18+)
npm install @refinedev/core @refinedev/antd @refinedev/kbar @refinedev/react-router-v6 @refinedev/react-table @tanstack/react-table -w apps/saas-app
```

### Option 4: Skip Installation (Code is Ready)

The Refine integration code is already in place. The packages are listed in `apps/saas-app/package.json`:

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

When you run `yarn install` or `npm install` successfully (after fixing the package manager issue), these will be installed automatically.

## Verification

After installation, verify the packages are installed:

```bash
# Check if Refine packages are in node_modules
ls -la node_modules/@refinedev/

# Should show:
# - core
# - antd
# - kbar
# - react-router-v6
# - react-table
```

## Testing the Integration

Once dependencies are installed:

```bash
# Start the development server
npm run dev:saas

# Or
yarn dev:saas
```

Then:
1. Open http://localhost:3000
2. You should see the Refine-powered layout
3. Try the command palette: Press `Ctrl+K` (or `Cmd+K` on Mac)
4. Navigate through the sidebar menu

## Troubleshooting

### Error: "Cannot find module '@refinedev/core'"

**Cause**: Dependencies not installed
**Solution**: Follow one of the installation options above

### Error: "This project's package.json defines packageManager: yarn@4.6.0"

**Cause**: Yarn version mismatch
**Solution**: Use Option 1 (Enable Corepack) or Option 2 (Install Yarn 4)

### Error: "Unsupported URL Type workspace:"

**Cause**: npm doesn't support the `workspace:` protocol
**Solution**: Use Yarn instead of npm, or enable Corepack

### Build Errors After Installation

**Cause**: TypeScript or build cache issues
**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules
rm -rf apps/saas-app/node_modules
yarn install
npm run build:saas
```

## Alternative: Gradual Migration

If you want to test Refine without fully committing:

1. **Keep the old layout** by reverting `src/routes/index.tsx`:
   ```typescript
   import { AppLayout } from '../components/AppLayout';
   <Route path="/" element={<AppLayout />}>
   ```

2. **Create a test route** with Refine layout:
   ```typescript
   <Route path="/refine-test" element={<RefineLayout />}>
     <Route index element={<div>Refine Test Page</div>} />
   </Route>
   ```

3. **Compare both layouts** side by side

4. **Switch when ready** by updating the main route

## Next Steps

After successful installation:

1. Read `REFINE_INTEGRATION.md` for detailed documentation
2. Review `REFINE_CHANGES_SUMMARY.md` for what changed
3. Start the dev server and test the application
4. Customize the layout, theme, and resources as needed

## Support

If you continue to have installation issues:

1. Check Node.js version: `node --version` (should be 16.9+)
2. Check npm version: `npm --version`
3. Check Yarn version: `yarn --version`
4. Review the error logs in `~/.npm/_logs/`
5. Try clearing npm cache: `npm cache clean --force`

## Contact

For Refine-specific questions:
- Refine Discord: https://discord.gg/refine
- Refine GitHub: https://github.com/refinedev/refine/issues

For project-specific questions:
- Check the documentation files in this directory
- Review the code changes in `src/` directory

