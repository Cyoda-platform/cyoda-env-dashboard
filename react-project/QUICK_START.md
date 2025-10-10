# Quick Start Guide - React Migration

This guide will help you get started with the React migration project.

## Prerequisites

- Node.js >= 22.0.0
- npm (comes with Node.js)

## Installation

```bash
# Navigate to the React project
cd react-project

# Install all dependencies
npm install
```

## Project Structure

```
react-project/
├── packages/
│   └── ui-lib-react/          # Shared UI component library
├── package.json               # Root workspace configuration
└── README.md                  # Full documentation
```

## Development

### Work on UI Library

```bash
# Navigate to UI library
cd packages/ui-lib-react

# Start development server
npm run dev

# Run tests
npm test

# Build library
npm run build

# Type check
npm run type-check
```

### Run All Packages

```bash
# From root directory
npm run dev          # Start all packages in dev mode
npm run build        # Build all packages
npm test             # Run all tests
npm run lint         # Lint all packages
```

## Adding a New Component

1. Create component directory:
```bash
cd packages/ui-lib-react/src/components
mkdir MyComponent
```

2. Create component files:
```tsx
// MyComponent/MyComponent.tsx
import React from 'react'
import './MyComponent.scss'

export interface MyComponentProps {
  title: string
  onClick?: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div className="my-component" onClick={onClick}>
      <h2>{title}</h2>
    </div>
  )
}
```

3. Create styles:
```scss
// MyComponent/MyComponent.scss
.my-component {
  padding: 1rem;
  
  h2 {
    color: #333;
  }
}
```

4. Create index file:
```ts
// MyComponent/index.ts
export { MyComponent } from './MyComponent'
export type { MyComponentProps } from './MyComponent'
```

5. Export from components index:
```ts
// components/index.ts
export * from './MyComponent'
```

## Testing

### Write a Test

```tsx
// MyComponent/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Run Tests

```bash
npm test                    # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run with coverage
```

## Common Tasks

### Add a Dependency

```bash
# Add to UI library
cd packages/ui-lib-react
npm install package-name

# Add dev dependency
npm install -D package-name
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Migration Workflow

### Migrating a Vue Component

1. **Find the Vue component** in `.old_project /packages/cyoda-ui-lib`
2. **Analyze the component**:
   - Props
   - Events
   - Slots
   - Computed properties
   - Methods
3. **Create React equivalent**:
   - Props → Props interface
   - Events → Callback props
   - Slots → children prop
   - Computed → useMemo
   - Methods → functions
4. **Write tests**
5. **Update exports**

### Example Migration

**Vue (Before)**:
```vue
<template>
  <button @click="handleClick" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
```

**React (After)**:
```tsx
interface ButtonProps {
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  disabled,
  onClick,
  children
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <button onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  )
}
```

## Troubleshooting

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Test Failures

```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- MyComponent.test.tsx
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Getting Help

- Check [REACT_MIGRATION_PLAN.md](../REACT_MIGRATION_PLAN.md) for overall strategy
- Check [MIGRATION_PROGRESS.md](../MIGRATION_PROGRESS.md) for current status
- Check [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) for latest updates

## Next Steps

1. Review the migration plan
2. Familiarize yourself with the codebase structure
3. Start migrating components from the priority list
4. Write tests for migrated components
5. Update documentation as you go

---

**Happy Coding! 🚀**

