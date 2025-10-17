// Mock for @cyoda/ui-lib-react
// This will be replaced with the actual package once it's available

import React from 'react';
import { Outlet } from 'react-router-dom';

export const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="login-layout">{children}</div>;
};

export const BaseLayout: React.FC = () => {
  return (
    <div className="base-layout">
      <Outlet />
    </div>
  );
};

