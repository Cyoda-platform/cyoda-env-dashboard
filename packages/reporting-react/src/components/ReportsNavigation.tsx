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

  const isReportsPage = location.pathname === '/reporting/reports' ||
                        location.pathname.startsWith('/reporting/report-editor');
  const isStreamReportsPage = location.pathname.startsWith('/reporting/reports/stream');
  const isCatalogueOfAliasesPage = location.pathname.startsWith('/reporting/catalogue-of-aliases');

  return (
    <div className="reports-navigation">
      <Link
        to="/reporting/reports"
        className={isReportsPage ? 'active' : ''}
      >
        Report config editor
      </Link>
      <span className="separator">|</span>
      <Link
        to="/reporting/reports/stream"
        className={isStreamReportsPage ? 'active' : ''}
      >
        Stream Reports
      </Link>
      <span className="separator">|</span>
      <Link
        to="/reporting/catalogue-of-aliases"
        className={isCatalogueOfAliasesPage ? 'active' : ''}
      >
        Catalogue of Aliases
      </Link>
    </div>
  );
};

export default ReportsNavigation;

