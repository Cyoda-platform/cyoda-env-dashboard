/**
 * Tableau React - Main Entry Point
 * Migrated from: .old_project/packages/tableau/src/main.ts
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

