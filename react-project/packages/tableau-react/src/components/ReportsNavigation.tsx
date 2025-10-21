/**
 * Reports Navigation Component
 * Migrated from: .old_project/packages/http-api/src/layout/BaseWrapperLayout.vue (lines 23-27)
 * 
 * Provides navigation links between Report Config Editor and Stream Reports
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ReportsNavigation.scss';

const ReportsNavigation: React.FC = () => {
  const location = useLocation();

  const isReportsPage = location.pathname === '/tableau/reports' || 
                        location.pathname.startsWith('/tableau/report-editor');
  const isStreamReportsPage = location.pathname.startsWith('/tableau/reports/stream');

  return (
    <div className="reports-navigation">
      <Link 
        to="/tableau/reports" 
        className={isReportsPage ? 'active' : ''}
      >
        Report config editor
      </Link>
      <span className="separator">|</span>
      <Link 
        to="/tableau/reports/stream" 
        className={isStreamReportsPage ? 'active' : ''}
      >
        Stream Reports
      </Link>
    </div>
  );
};

export default ReportsNavigation;

