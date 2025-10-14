/**
 * Main Entry Point
 * Migrated from @cyoda/processing-manager/src/main.ts
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

// Load config.json before mounting the app
fetch(import.meta.env.BASE_URL + 'config.json?mktime=' + Date.now())
  .then((response) => response.json())
  .then((config) => {
    // Store config in window object for global access
    (window as any).__APP_CONFIG__ = config;

    // Mount the app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to load config:', error);
    
    // Mount the app anyway with default config
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });

