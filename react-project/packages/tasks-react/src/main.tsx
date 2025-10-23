/**
 * Main Entry Point
 * Migrated from: .old_project/packages/tasks/src/main.ts
 */

// IMPORTANT: Load polyfills FIRST before any other imports
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

