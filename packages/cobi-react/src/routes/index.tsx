import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages - will be created next
import DataMapperIndex from '../pages/DataMapper/DataMapperIndex';
import DataMapperEdit from '../pages/DataMapper/DataMapperEdit';
import DataSourceConfigIndex from '../pages/DataSourceConfig/DataSourceConfigIndex';
import DataSourceConfigEdit from '../pages/DataSourceConfig/DataSourceConfigEdit';
import DataChainingIndex from '../pages/DataChaining/DataChainingIndex';
import DataChainingEdit from '../pages/DataChaining/DataChainingEdit';
import DataManagementDashboard from '../pages/DataManagementDashboard/DataManagementDashboard';
import Tools from '../pages/Tools/Tools';
import Page404 from '../pages/Page404';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Redirect root to data-mapper */}
      <Route path="/" element={<Navigate to="/data-mapper" replace />} />

      {/* Data Mapper Routes */}
      <Route path="/data-mapper" element={<DataMapperIndex />} />
      <Route path="/data-mapper/configuration" element={<DataMapperEdit />} />
      <Route path="/data-mapper/configuration/:id" element={<DataMapperEdit />} />

      {/* Data Source Configuration Routes */}
      <Route path="/data-mapper/data-source-config-creation" element={<DataSourceConfigIndex />} />
      <Route path="/data-mapper/data-source-config-creation/configuration" element={<DataSourceConfigEdit />} />

      {/* Data Chaining Routes */}
      <Route path="/data-chaining" element={<DataChainingIndex />} />
      <Route path="/data-chaining/configuration" element={<DataChainingEdit />} />

      {/* Data Management Dashboard */}
      <Route path="/data-management-dashboard" element={<DataManagementDashboard />} />

      {/* Tools */}
      <Route path="/tools" element={<Tools />} />

      {/* 404 */}
      <Route path="/404" element={<Page404 />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;

