/**
 * Routes configuration for Source Configuration
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ConfigurationsList from '../pages/ConfigurationsList';

const SourceConfigRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ConfigurationsList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default SourceConfigRoutes;

