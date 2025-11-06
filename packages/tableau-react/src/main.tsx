/**
 * Tableau React - Main Entry Point
 * Migrated from: .old_project/packages/tableau/src/main.ts
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

// Initialize mock Tableau Web Data Connector if not already loaded
if (!window.tableau) {
  window.tableau = {
    makeConnector: () => ({}),
    connectionData: '',
    connectionName: '',
    submit: () => {
      console.log('Tableau submit called (mock)');
    },
    dataTypeEnum: {
      string: 'string',
      int: 'int',
      float: 'float',
      bool: 'bool',
      date: 'date',
      datetime: 'datetime',
    },
    registerConnector: () => {
      console.log('Tableau connector registered (mock)');
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

