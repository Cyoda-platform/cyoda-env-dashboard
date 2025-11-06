# Migration Guide: Vue 3 to React 18

Complete guide for migrating from the Vue 3 Processing Manager to React 18.

## Table of Contents

- [Overview](#overview)
- [Key Differences](#key-differences)
- [State Management](#state-management)
- [Routing](#routing)
- [Components](#components)
- [API Calls](#api-calls)
- [Styling](#styling)
- [Testing](#testing)
- [Breaking Changes](#breaking-changes)
- [Migration Checklist](#migration-checklist)

## Overview

The Processing Manager has been migrated from Vue 3 to React 18 with the following technology changes:

| Aspect | Vue 3 | React 18 |
|--------|-------|----------|
| **Framework** | Vue 3.4.x | React 18.3.1 |
| **State Management** | Pinia | Zustand 5.0.2 |
| **Server State** | Pinia Actions | React Query 5.62.11 |
| **Routing** | Vue Router 4.x | React Router 7.1.1 |
| **Build Tool** | Vite | Vite |
| **UI Library** | Ant Design Vue | Ant Design React 5.22.6 |
| **Charts** | vue-chartjs | react-chartjs-2 5.3.0 |
| **Testing** | Vitest + Vue Test Utils | Vitest + React Testing Library |

## Key Differences

### 1. Component Syntax

**Vue 3 (Composition API):**
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('Hello');
const handleClick = () => {
  title.value = 'Clicked!';
};
</script>
```

**React 18:**
```tsx
import { useState } from 'react';

export default function MyComponent() {
  const [title, setTitle] = useState('Hello');
  
  const handleClick = () => {
    setTitle('Clicked!');
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### 2. Reactivity

**Vue 3:**
- Automatic reactivity with `ref()` and `reactive()`
- `.value` required to access ref values in script
- No `.value` needed in template

**React 18:**
- Explicit state updates with `useState()`
- State updates trigger re-renders
- No automatic tracking

## State Management

### Pinia → Zustand

**Vue 3 (Pinia):**
```typescript
// stores/app.ts
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    node: '',
    loading: false,
  }),
  
  actions: {
    setNode(node: string) {
      this.node = node;
    },
    
    async loadData() {
      this.loading = true;
      // ... fetch data
      this.loading = false;
    },
  },
});

// Usage in component
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
appStore.setNode('node-01');
console.log(appStore.node);
```

**React 18 (Zustand):**
```typescript
// stores/appStore.ts
import { create } from 'zustand';

interface AppStore {
  node: string;
  loading: boolean;
  setNode: (node: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  node: '',
  loading: false,
  
  setNode: (node) => set({ node }),
}));

// Usage in component
import { useAppStore } from '@/stores/appStore';

function MyComponent() {
  const node = useAppStore((state) => state.node);
  const setNode = useAppStore((state) => state.setNode);
  
  setNode('node-01');
  console.log(node);
}
```

### API Calls: Pinia Actions → React Query

**Vue 3 (Pinia):**
```typescript
// stores/processing.ts
export const useProcessingStore = defineStore('processing', {
  state: () => ({
    transactions: [],
    loading: false,
  }),
  
  actions: {
    async loadTransactions() {
      this.loading = true;
      try {
        const { data } = await axios.get('/api/transactions');
        this.transactions = data;
      } finally {
        this.loading = false;
      }
    },
  },
});

// Usage
const store = useProcessingStore();
await store.loadTransactions();
```

**React 18 (React Query):**
```typescript
// hooks/useProcessing.ts
export function useTransactions(params?: any) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await axios.get('/api/transactions', { params });
      return data;
    },
  });
}

// Usage
function MyComponent() {
  const { data, isLoading, error, refetch } = useTransactions({ page: 1 });
  
  if (isLoading) return <Spin />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.map(...)}</div>;
}
```

## Routing

### Vue Router → React Router

**Vue 3:**
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/nodes',
    name: 'Nodes',
    component: () => import('@/pages/Nodes.vue'),
  },
  {
    path: '/nodes/:name',
    name: 'NodeDetail',
    component: () => import('@/pages/NodesDetail.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory('/processing-ui'),
  routes,
});

// Usage in component
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

router.push('/nodes');
console.log(route.params.name);
```

**React 18:**
```typescript
// routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/processing-ui/nodes',
    element: <Nodes />,
  },
  {
    path: '/processing-ui/nodes/:name',
    element: <NodesDetail />,
  },
]);

// Usage in component
import { useNavigate, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { name } = useParams();
  
  navigate('/processing-ui/nodes');
  console.log(name);
}
```

## Components

### Props

**Vue 3:**
```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});
</script>
```

**React 18:**
```tsx
interface Props {
  title: string;
  count?: number;
}

export default function MyComponent({ title, count = 0 }: Props) {
  return <div>{title}: {count}</div>;
}
```

### Events

**Vue 3:**
```vue
<template>
  <button @click="emit('update', value)">Update</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  update: [value: string];
}>();
</script>
```

**React 18:**
```tsx
interface Props {
  onUpdate: (value: string) => void;
}

export default function MyComponent({ onUpdate }: Props) {
  return <button onClick={() => onUpdate('value')}>Update</button>;
}
```

### Computed Values

**Vue 3:**
```typescript
import { computed } from 'vue';

const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

**React 18:**
```typescript
import { useMemo } from 'react';

const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```

### Watchers

**Vue 3:**
```typescript
import { watch } from 'vue';

watch(node, (newValue, oldValue) => {
  console.log('Node changed:', newValue);
});
```

**React 18:**
```typescript
import { useEffect } from 'react';

useEffect(() => {
  console.log('Node changed:', node);
}, [node]);
```

## Styling

Both versions use SCSS. The main difference is how styles are imported:

**Vue 3:**
```vue
<style scoped lang="scss">
.my-component {
  color: red;
}
</style>
```

**React 18:**
```tsx
import './MyComponent.scss';

export default function MyComponent() {
  return <div className="my-component">Content</div>;
}
```

## Testing

### Component Testing

**Vue 3 (Vue Test Utils):**
```typescript
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

test('renders correctly', () => {
  const wrapper = mount(MyComponent, {
    props: { title: 'Test' },
  });
  
  expect(wrapper.text()).toContain('Test');
});
```

**React 18 (React Testing Library):**
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent title="Test" />);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## Breaking Changes

### 1. No More Template Syntax
- Replace `v-if`, `v-for`, `v-show` with JavaScript expressions
- Replace `@click` with `onClick`
- Replace `:prop` with `prop={value}`

### 2. State Updates Are Not Automatic
- Must explicitly call state setters
- State updates are asynchronous
- Multiple state updates may be batched

### 3. No More Scoped Styles
- Use CSS Modules or unique class names
- Consider using CSS-in-JS libraries if needed

### 4. Different Lifecycle
- `onMounted` → `useEffect(() => {}, [])`
- `onUnmounted` → `useEffect(() => { return () => {} }, [])`
- `onUpdated` → `useEffect(() => {})`

### 5. Refs Work Differently
- Vue `ref()` → React `useRef()` for DOM elements
- Vue `ref()` → React `useState()` for reactive values

## Migration Checklist

- [ ] Update package.json dependencies
- [ ] Convert Pinia stores to Zustand
- [ ] Move API calls to React Query hooks
- [ ] Convert Vue Router to React Router
- [ ] Convert `.vue` files to `.tsx` files
- [ ] Replace template syntax with JSX
- [ ] Update event handlers (`@click` → `onClick`)
- [ ] Convert `v-if`/`v-for` to JavaScript
- [ ] Update computed properties to `useMemo`
- [ ] Update watchers to `useEffect`
- [ ] Convert component props
- [ ] Update tests to React Testing Library
- [ ] Update SCSS imports
- [ ] Test all functionality
- [ ] Update documentation

---

**Last Updated:** 2025-10-14  
**Version:** 1.0.0

