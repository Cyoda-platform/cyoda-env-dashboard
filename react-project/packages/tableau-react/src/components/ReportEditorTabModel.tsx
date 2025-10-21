/**
 * ReportEditorTabModel Component
 * Tab for selecting entity class and configuring column definitions
 *
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue
 *
 * Full CyodaModelling component migration complete!
 */

import React, { useState, useEffect } from 'react';
import { Form, Select, Alert } from 'antd';
import { ModellingColDefs } from './Modelling/ModellingColDefs';
import { ModellingAliases } from './Modelling/Alias/ModellingAliases';
import type { ReportDefinition } from '../types';
import axios from 'axios';
import './ReportEditorTabModel.scss';

interface ReportEditorTabModelProps {
  configDefinition: ReportDefinition;
  onChange: (config: Partial<ReportDefinition>) => void;
  readOnly?: boolean;
  showAliases?: boolean;
}

interface EntityType {
  name: string;
  label: string;
  type: string;
}

const ReportEditorTabModel: React.FC<ReportEditorTabModelProps> = ({
  configDefinition,
  onChange,
  readOnly = false,
  showAliases = true,
}) => {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(false);

  // Load entity types on mount
  useEffect(() => {
    const loadEntityTypes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<EntityType[]>('/platform-api/reporting/types/fetch');
        setEntityTypes(data);
      } catch (error) {
        console.error('Failed to load entity types:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEntityTypes();
  }, []);

  const handleEntityClassChange = (value: string) => {
    onChange({ requestClass: value });
  };

  return (
    <div className="report-editor-tab-model">
      <Form layout="vertical">
        <Form.Item label="Entity Class" required>
          <Select
            showSearch
            placeholder="Select Entity Class"
            value={configDefinition.requestClass}
            onChange={handleEntityClassChange}
            disabled={readOnly || loading}
            loading={loading}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={entityTypes.map(type => ({
              value: type.name,
              label: type.label || type.name,
            }))}
          />
        </Form.Item>
      </Form>

      {!configDefinition.requestClass && (
        <Alert
          message="Please select an Entity Class first"
          description="You need to select an entity class before you can add column definitions or aliases."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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

