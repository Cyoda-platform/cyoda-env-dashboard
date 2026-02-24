# Package Structure and Dependencies Audit Report

**Generated:** 2026-02-11  
**Status:** Complete

## 1. Dependency Graph

### Foundation Layer (No Internal Dependencies)
```
@cyoda/ui-lib-react     → No internal @cyoda dependencies
@cyoda/http-api-react   → No internal @cyoda dependencies
@cyoda/cli              → No internal @cyoda dependencies (Node.js CLI tool)
```

### Feature Layer (Depends on Foundation)
```
@cyoda/tableau-react              → @cyoda/ui-lib-react, @cyoda/http-api-react
@cyoda/statemachine-react         → @cyoda/ui-lib-react, @cyoda/http-api-react
@cyoda/tasks-react                → @cyoda/ui-lib-react, @cyoda/http-api-react
@cyoda/source-configuration-react → @cyoda/ui-lib-react, @cyoda/http-api-react
@cyoda/cyoda-sass-react           → @cyoda/ui-lib-react, @cyoda/http-api-react
```

### Extended Feature Layer (Depends on Foundation + Other Features)
```
@cyoda/processing-manager-react   → @cyoda/ui-lib-react, @cyoda/http-api-react, @cyoda/tableau-react
```

### Standalone (No Internal Dependencies - Self-Contained)
```
@cyoda/cobi-react                 → No internal @cyoda dependencies (has own API layer)
```

## 2. Duplicated Code Patterns

### 2.1 ResizableTitle Component (IDENTICAL - 44 lines each)
| Package | File Path |
|---------|-----------|
| processing-manager-react | `src/components/ResizableTitle.tsx` |
| tasks-react | `src/components/ResizableTitle.tsx` |
| statemachine-react | `src/components/ResizableTitle.tsx` |
| tableau-react | `src/components/ResizableTitle.tsx` |

**Recommendation:** Move to `@cyoda/ui-lib-react`

### 2.2 ErrorBoundary Component (SIMILAR - Different implementations)
| Package | File Path | Lines | Notes |
|---------|-----------|-------|-------|
| cobi-react | `src/components/ErrorBoundary.tsx` | 89 | Uses Result component |
| tasks-react | `src/components/ErrorBoundary.tsx` | 181 | Most feature-rich (fallback, onError callback) |
| source-configuration-react | `src/components/ErrorBoundary.tsx` | 78 | Uses Alert component |

**Recommendation:** Consolidate to `@cyoda/ui-lib-react` using tasks-react version as base

### 2.3 appStore (DIFFERENT - Package-specific state)
| Package | File Path | Purpose |
|---------|-----------|---------|
| cobi-react | `src/stores/appStore.ts` | COBI-specific (mapping IDs, sidebar) |
| cyoda-sass-react | `src/stores/appStore.ts` | Menu state |
| processing-manager-react | `src/stores/appStore.ts` | Node selection, proxy config |

**Recommendation:** Keep separate - these are intentionally different per-app stores

### 2.4 globalUiSettingsStore (SIMILAR - Should be unified)
| Package | File Path | Notes |
|---------|-----------|-------|
| http-api-react | `src/stores/globalUiSettingsStore.ts` | Base version (entityType only) |
| statemachine-react | `src/stores/globalUiSettingsStore.ts` | Extended (adds isEnabledTechView) |

**Recommendation:** Merge into `@cyoda/http-api-react` with all features

### 2.5 test-utils.tsx (SIMILAR - Testing utilities)
| Package | File Path | Features |
|---------|-----------|----------|
| ui-lib-react | `src/test-utils.tsx` | Basic (ConfigProvider only) |
| cobi-react | `src/test/test-utils.tsx` | Full (QueryClient, Router, ConfigProvider) |
| tableau-react | `src/test/test-utils.tsx` | Full (QueryClient, Router, ConfigProvider) |
| processing-manager-react | `src/test/test-utils.tsx` | QueryClient only |

**Recommendation:** Create unified test-utils in `@cyoda/ui-lib-react`

### 2.6 HelperModelling (DIFFERENT VERSIONS)
| Package | File Path | Lines | Notes |
|---------|-----------|-------|-------|
| http-api-react | `src/utils/HelperModelling.ts` | 43 | Basic (filterData, sortData) |
| tableau-react | `src/utils/HelperModelling.ts` | 258 | Extended (full modelling support) |

**Recommendation:** Keep tableau-react version, remove http-api-react version

### 2.7 HelperDetailEntity (NEARLY IDENTICAL)
| Package | File Path | Notes |
|---------|-----------|-------|
| ui-lib-react | `src/utils/HelperDetailEntity.ts` | Original |
| tableau-react | `src/utils/HelperDetailEntity.ts` | Copy with different import |

**Recommendation:** Remove from tableau-react, import from ui-lib-react

