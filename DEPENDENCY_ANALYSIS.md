# Dependency Analysis - All Packages

**Date**: 2025-10-20  
**Project**: Vue to React Migration  
**Status**: Complete - All 10 Packages Analyzed

---

## 📊 Overview

This document provides a comprehensive analysis of all dependencies across the 10 migrated packages.

### Package Summary

| Package | Dependencies | DevDependencies | Total |
|---------|-------------|-----------------|-------|
| ui-lib-react | 9 | 19 | 28 |
| http-api-react | 5 | 14 | 19 |
| tasks-react | 9 | 13 | 22 |
| statemachine-react | 9 | 13 | 22 |
| processing-manager-react | 12 | 9 | 21 |
| cli | 9 | 0 | 9 |
| tableau-react | 10 | 11 | 21 |
| source-configuration-react | 10 | 15 | 25 |
| cobi-react | 28 | 16 | 44 |
| cyoda-sass-react | 19 | 15 | 34 |

---

## 🔍 Core Dependencies Analysis

### React & React DOM
**Version**: `^18.3.1` (ui-lib, http-api, tasks, statemachine, processing-manager, source-config, cyoda-sass)  
**Version**: `^18.2.0` (cobi)  
**Status**: ✅ Consistent across most packages  
**Note**: COBI uses slightly older version (18.2.0 vs 18.3.1)

### React Router DOM
**Versions**:
- `^7.9.4` - ui-lib-react, tasks-react
- `^7.1.1` - processing-manager-react
- `^7.1.3` - source-configuration-react
- `^6.28.1` - tableau-react
- `^6.26.2` - cyoda-sass-react
- `^6.20.0` - cobi-react

**Status**: ⚠️ **VERSION INCONSISTENCY** - Mix of v6 and v7
**Recommendation**: Standardize on v7.x for all packages

### Ant Design (antd)
**Versions**:
- `^5.20.0` - ui-lib-react, tasks-react, statemachine-react
- `^5.22.6` - processing-manager-react, tableau-react
- `^5.22.5` - source-configuration-react
- `^5.21.2` - cyoda-sass-react
- `^5.12.0` - cobi-react

**Status**: ⚠️ **MINOR VERSION INCONSISTENCY**
**Recommendation**: Standardize on latest v5.22.x

### Ant Design Icons
**Versions**:
- `^6.1.0` - ui-lib-react
- `^5.5.2` - processing-manager-react
- `^5.5.1` - cyoda-sass-react
- `^5.2.6` - cobi-react

**Status**: ⚠️ **MAJOR VERSION INCONSISTENCY** - v5 vs v6
**Recommendation**: Standardize on v6.x

### Axios
**Versions**:
- `^1.7.9` - ui-lib, http-api, tasks, statemachine, processing-manager, tableau, source-config
- `^1.7.7` - cyoda-sass-react
- `^1.6.2` - cobi-react

**Status**: ⚠️ **MINOR VERSION INCONSISTENCY**
**Recommendation**: Standardize on latest v1.7.9

### React Query (@tanstack/react-query)
**Versions**:
- `^5.62.11` - http-api, tasks, statemachine, processing-manager, source-config
- `^5.59.16` - cyoda-sass-react
- `^5.14.0` - cobi-react

**Status**: ⚠️ **MINOR VERSION INCONSISTENCY**
**Recommendation**: Standardize on latest v5.62.11

### Zustand
**Versions**:
- `^5.0.2` - http-api, tasks, statemachine, processing-manager, tableau, source-config
- `^5.0.0` - cyoda-sass-react
- `^4.4.7` - cobi-react

**Status**: ⚠️ **MAJOR VERSION INCONSISTENCY** - v4 vs v5
**Recommendation**: Upgrade COBI to v5.x

### TypeScript
**Versions**:
- `^5.7.3` - ui-lib, http-api, tasks, statemachine, processing-manager, tableau, source-config, cyoda-sass
- `^5.3.3` - cobi-react

**Status**: ⚠️ **MINOR VERSION INCONSISTENCY**
**Recommendation**: Standardize on v5.7.3

### Vite
**Versions**:
- `^6.0.11` - ui-lib, http-api, tasks, statemachine, processing-manager, tableau, source-config, cyoda-sass
- `^5.0.8` - cobi-react

**Status**: ⚠️ **MAJOR VERSION INCONSISTENCY** - v5 vs v6
**Recommendation**: Upgrade COBI to v6.x

### Vitest
**Versions**:
- `^3.0.3` - ui-lib, http-api, tasks, source-config, cyoda-sass
- `^3.2.4` - processing-manager
- `^1.0.4` - cobi-react

**Status**: ⚠️ **MAJOR VERSION INCONSISTENCY** - v1 vs v3
**Recommendation**: Upgrade COBI to v3.x

---

## 📦 Package-Specific Dependencies

### 1. ui-lib-react (Foundation)
**Unique Dependencies**:
- `@types/sortablejs: ^1.15.8`
- `classnames: ^2.5.1`
- `lodash: ^4.17.21`
- `mark.js: ^8.11.1`
- `moment: ^2.30.1`
- `sortablejs: ^1.15.6`

**Purpose**: Shared UI components library

### 2. http-api-react (Foundation)
**Unique Dependencies**:
- `qs: ^6.14.0` - Query string parsing
- `@types/qs: ^6.9.18`

**Purpose**: HTTP API layer with React Query hooks

### 3. tasks-react
**Unique Dependencies**:
- `dayjs: ^1.11.13` - Date manipulation

**Purpose**: Task management application

### 4. statemachine-react
**Unique Dependencies**:
- `cytoscape: ^3.31.0` - Graph visualization
- `js-beautify: ^1.15.1` - Code formatting
- `prismjs: ^1.29.0` - Syntax highlighting
- `@types/cytoscape: ^3.21.9`
- `@types/js-beautify: ^1.14.3`
- `@types/prismjs: ^1.26.5`

**Purpose**: Workflow and state machine management

### 5. processing-manager-react
**Unique Dependencies**:
- `chart.js: ^4.4.7` - Charting library
- `chartjs-adapter-date-fns: ^3.0.0` - Date adapter
- `date-fns: ^4.1.0` - Date utilities
- `react-chartjs-2: ^5.3.0` - React wrapper for Chart.js
- `msw: ^2.7.0` - Mock Service Worker (dev)

**Purpose**: Data processing and batch operations

### 6. cli
**Unique Dependencies**:
- `chalk: ^5.4.1` - Terminal colors
- `cli-table3: ^0.6.5` - Terminal tables
- `commander: ^13.1.0` - CLI framework
- `envfile: ^7.1.0` - Environment file parsing
- `figlet: ^1.8.0` - ASCII art
- `inquirer: ^12.3.2` - Interactive prompts
- `listr2: ^8.2.5` - Task lists
- `signale: ^1.4.0` - Logging
- `tslog: ^4.9.3` - TypeScript logging

**Purpose**: CLI setup utility

### 7. tableau-react
**Unique Dependencies**:
- `prismjs: ^1.30.0` - Syntax highlighting
- `@playwright/test: ^1.56.0` - E2E testing
- `playwright: ^1.56.0`

**Purpose**: Tableau Web Data Connector integration

### 8. source-configuration-react
**Unique Dependencies**:
- `filepond: ^4.32.7` - File upload
- `filepond-plugin-file-validate-size: ^2.2.8`
- `filepond-plugin-file-validate-type: ^1.2.9`
- `react-filepond: ^7.1.2`
- `vite-plugin-dts: ^4.3.0` - TypeScript declarations

**Purpose**: Data source configuration management

### 9. cobi-react (Main Application)
**Unique Dependencies**:
- `@monaco-editor/react: ^4.7.0` - Code editor
- `@svgdotjs/svg.js: ^3.2.5` - SVG manipulation
- `blockly: ^11.2.1` - Visual programming
- `buffer: ^6.0.3` - Buffer polyfill
- `crypto-js: ^4.2.0` - Cryptography
- `csv-parse: ^5.6.0` - CSV parsing
- `csv-stringify: ^6.5.2` - CSV generation
- `cytoscape: ^3.31.0` - Graph visualization
- `fast-xml-parser: ^4.5.1` - XML parsing
- `file-saver: ^2.0.5` - File saving
- `filepond: ^4.32.7` - File upload
- `jsonpath-plus: ^10.2.0` - JSON path queries
- `jszip: ^3.10.1` - ZIP file handling
- `react-cytoscapejs: ^2.0.0` - React wrapper for Cytoscape

**Purpose**: Main data mapping and configuration application

### 10. cyoda-sass-react (Final Package)
**Unique Dependencies**:
- `@dnd-kit/core: ^6.1.0` - Drag and drop
- `@dnd-kit/sortable: ^8.0.0`
- `@dnd-kit/utilities: ^3.2.2`
- `@fortawesome/fontawesome-svg-core: ^6.7.2` - Font Awesome icons
- `@fortawesome/free-brands-svg-icons: ^6.7.2`
- `@fortawesome/free-solid-svg-icons: ^6.7.2`
- `@fortawesome/react-fontawesome: ^0.2.2`
- `file-saver: ^2.0.5` - File saving
- `uuid: ^11.0.5` - UUID generation

**Purpose**: Trino SQL schema management

---

## ⚠️ Issues & Recommendations

### Critical Issues

1. **React Router DOM Version Inconsistency**
   - **Issue**: Mix of v6 and v7 across packages
   - **Impact**: Potential API incompatibilities
   - **Recommendation**: Standardize on v7.x

2. **Zustand Major Version Difference**
   - **Issue**: COBI uses v4.4.7, others use v5.x
   - **Impact**: Breaking changes between v4 and v5
   - **Recommendation**: Upgrade COBI to v5.x

3. **Vite Major Version Difference**
   - **Issue**: COBI uses v5.0.8, others use v6.x
   - **Impact**: Build configuration differences
   - **Recommendation**: Upgrade COBI to v6.x

4. **Vitest Major Version Difference**
   - **Issue**: COBI uses v1.0.4, others use v3.x
   - **Impact**: Test API differences
   - **Recommendation**: Upgrade COBI to v3.x

### Minor Issues

5. **Ant Design Icons Major Version**
   - **Issue**: ui-lib uses v6.1.0, others use v5.x
   - **Recommendation**: Standardize on v6.x

6. **React Query Minor Versions**
   - **Issue**: COBI uses v5.14.0, others use v5.62.11
   - **Recommendation**: Upgrade to latest v5.62.11

7. **Axios Minor Versions**
   - **Issue**: COBI uses v1.6.2, others use v1.7.9
   - **Recommendation**: Upgrade to latest v1.7.9

---

## ✅ Action Items

### High Priority
1. ✅ Standardize React Router DOM to v7.x across all packages
2. ✅ Upgrade COBI's Zustand from v4 to v5
3. ✅ Upgrade COBI's Vite from v5 to v6
4. ✅ Upgrade COBI's Vitest from v1 to v3

### Medium Priority
5. ✅ Standardize Ant Design to v5.22.x
6. ✅ Standardize Ant Design Icons to v6.x
7. ✅ Upgrade all Axios to v1.7.9
8. ✅ Upgrade all React Query to v5.62.11

### Low Priority
9. ✅ Standardize TypeScript to v5.7.3
10. ✅ Review and update all devDependencies to latest stable versions

---

## 📈 Dependency Update Strategy

### Phase 1: Critical Updates (Week 1)
- Update React Router DOM across all packages
- Upgrade COBI's major version dependencies (Zustand, Vite, Vitest)
- Test all packages after updates

### Phase 2: Minor Updates (Week 2)
- Standardize Ant Design and Ant Design Icons
- Update Axios and React Query
- Update TypeScript

### Phase 3: DevDependencies (Week 3)
- Update all testing libraries
- Update build tools
- Update linters and formatters

### Phase 4: Verification (Week 4)
- Run all tests across all packages
- Verify builds
- Update documentation

---

## 🔒 Security Audit Results

### Vulnerability Summary (as of 2025-10-20)

| Package | Critical | High | Moderate | Low | Total |
|---------|----------|------|----------|-----|-------|
| ui-lib-react | 1 | 0 | 0 | 0 | 1 |
| cobi-react | 1 | 0 | 7 | 0 | 8 |
| cyoda-sass-react | 1 | 0 | 0 | 0 | 1 |

### Critical Vulnerabilities

#### 1. happy-dom (ui-lib-react)
- **Package**: `happy-dom`
- **Severity**: Critical
- **Version**: `<20.0.2`
- **Issue**: `--disallow-code-generation-from-strings` is not sufficient for isolating untrusted JavaScript
- **CVE**: GHSA-qpm2-6cq5-7pq5
- **Fix**: ✅ **Available** - Upgrade to `^20.0.2` or later
- **Action**: Update package.json to use `happy-dom: ^20.0.2`

#### 2. jsdom (cobi-react, cyoda-sass-react)
- **Package**: `jsdom`
- **Severity**: Critical (likely)
- **Action**: Review and update to latest version

### Moderate Vulnerabilities (cobi-react)

- **Count**: 7 moderate vulnerabilities
- **Action**: Run `npm audit fix` to automatically fix
- **Manual Review**: Check if any breaking changes

### Recommendations

1. **Immediate Action Required**:
   - ✅ Update `happy-dom` to `^20.0.2` in ui-lib-react
   - ✅ Update `jsdom` to latest version in all packages
   - ✅ Run `npm audit fix` in cobi-react

2. **Regular Security Audits**:
   - Run `npm audit` weekly
   - Set up automated security scanning (Dependabot, Snyk)
   - Monitor GitHub Security Advisories

3. **Dependency Management**:
   - Use `npm audit fix` for automatic fixes
   - Review breaking changes before major updates
   - Keep dependencies up to date

---

## 📋 Dependency Update Checklist

### Immediate (This Week)
- [ ] Fix critical security vulnerabilities
  - [ ] Update happy-dom to ^20.0.2
  - [ ] Update jsdom to latest
  - [ ] Run npm audit fix in cobi-react
- [ ] Standardize React Router DOM to v7.x
- [ ] Upgrade COBI's Zustand from v4 to v5
- [ ] Upgrade COBI's Vite from v5 to v6
- [ ] Upgrade COBI's Vitest from v1 to v3

### Short Term (Next 2 Weeks)
- [ ] Standardize Ant Design to v5.22.x
- [ ] Standardize Ant Design Icons to v6.x
- [ ] Upgrade all Axios to v1.7.9
- [ ] Upgrade all React Query to v5.62.11
- [ ] Standardize TypeScript to v5.7.3

### Medium Term (Next Month)
- [ ] Review and update all devDependencies
- [ ] Set up automated dependency updates
- [ ] Implement security scanning in CI/CD
- [ ] Create dependency update policy

### Long Term (Ongoing)
- [ ] Monthly dependency review
- [ ] Quarterly major version updates
- [ ] Annual dependency audit
- [ ] Keep documentation updated

---

## 🛠️ Tools & Commands

### Check for outdated packages
```bash
npm outdated
```

### Security audit
```bash
npm audit
npm audit fix
npm audit fix --force  # For breaking changes
```

### Update specific package
```bash
npm update <package-name>
npm install <package-name>@latest
```

### Update all packages
```bash
npx npm-check-updates -u
npm install
```

### Check for duplicate dependencies
```bash
npm dedupe
```

---

**End of Dependency Analysis**

**Last Updated**: 2025-10-20
**Next Review**: 2025-10-27 (Weekly)
**Security Status**: ⚠️ **Action Required** - Critical vulnerabilities found

