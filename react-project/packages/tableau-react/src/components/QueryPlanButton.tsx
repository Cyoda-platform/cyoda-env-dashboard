/**
 * QueryPlanButton Component
 * Button to view query execution plan for reports
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlan.vue
 */

import React, { useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CodeEditor } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface QueryPlanButtonProps {
  configDefinition: ReportDefinition;
}

export const QueryPlanButton: React.FC<QueryPlanButtonProps> = ({ configDefinition }) => {
  const [visible, setVisible] = useState(false);

  const { data: queryPlan, isLoading, refetch } = useQuery({
    queryKey: ['queryPlan', configDefinition],
    queryFn: async () => {
      const { data } = await axios.post(
        `${API_BASE}/platform-api/reporting/query-plan`,
        configDefinition
      );
      return JSON.stringify(data, null, 2);
    },
    enabled: false, // Only fetch when modal is opened
  });

  const handleOpen = () => {
    setVisible(true);
    refetch();
  };

  return (
    <>
      <Button icon={<EyeOutlined />} onClick={handleOpen}>
        Query Plan
      </Button>

      <Modal
        title="Query Execution Plan"
        open={visible}
        onCancel={() => setVisible(false)}
        width="80%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <CodeEditor
            value={queryPlan || ''}
            language="json"
            readOnly={true}
            height="500px"
          />
        )}
      </Modal>
    </>
  );
};

export default QueryPlanButton;

