/**
 * ReportEditorTabModel Component
 * Tab for configuring column definitions and aliases
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue
 */

import React from 'react';
import { ModellingColDefs } from './Modelling/ModellingColDefs';
import { ModellingAliases } from './Modelling/Alias/ModellingAliases';
import type { ReportDefinition } from '../types';
import './ReportEditorTabModel.scss';

interface ReportEditorTabModelProps {
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
  readOnly?: boolean;
  showAliases?: boolean;
}

const ReportEditorTabModel: React.FC<ReportEditorTabModelProps> = ({
  configDefinition,
  onChange,
  readOnly = false,
  showAliases = true,
}) => {
  return (
    <div className="report-editor-tab-model">
      <ModellingColDefs
        configDefinition={configDefinition}
        onChange={onChange}
        readOnly={readOnly}
      />

      {showAliases && (
        <>
          <hr className="section-divider" />
          <ModellingAliases
            configDefinition={configDefinition}
            onChange={onChange}
            readOnly={readOnly}
          />
        </>
      )}
    </div>
  );
};

export default ReportEditorTabModel;

