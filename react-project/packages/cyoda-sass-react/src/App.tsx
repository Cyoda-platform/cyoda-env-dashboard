import { Routes, Route, Navigate } from 'react-router-dom';
// TODO: Replace with actual @cyoda/ui-lib-react once available
import { BaseLayout } from './__mocks__/@cyoda/ui-lib-react';
import LoginView from './pages/LoginView';
import TrinoIndex from './pages/Trino/TrinoIndex';
import TrinoEdit from './pages/Trino/TrinoEdit';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Login route */}
      <Route path="/cyoda-sass/login" element={<LoginView />} />
      <Route path="/login" element={<Navigate to="/cyoda-sass/login" replace />} />

      {/* Main routes with layout */}
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<Navigate to="/cyoda-sass/trino" replace />} />
        <Route path="cyoda-sass/trino" element={<TrinoIndex />} />
        <Route path="cyoda-sass/trino/schema" element={<TrinoEdit />} />
        <Route path="cyoda-sass/trino/schema/:id" element={<TrinoEdit />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/cyoda-sass/trino" replace />} />
    </Routes>
  );
}

export default App;

