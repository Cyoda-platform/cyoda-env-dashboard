/**
 * QueryPlanButton Component
 * Button to view query execution plan for reports
 *
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlan.vue
 */

import React, { useState } from 'react';
import { Button, Modal, Alert, Radio, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { axios } from '@cyoda/http-api-react';
import QueryPlanDetail from './QueryPlanDetail';
import type { ReportDefinition } from '../types';
import './QueryPlanButton.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface QueryPlanButtonProps {
  configDefinition: ReportDefinition;
}

interface QueryPlan {
  optimized?: any;
  original?: any;
}

export const QueryPlanButton: React.FC<QueryPlanButtonProps> = ({ configDefinition }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queryPlan, setQueryPlan] = useState<QueryPlan>({});
  const [viewType, setViewType] = useState<'optimized' | 'original'>('optimized');

  const isReportSpeedSlow = () => {
    if (queryPlan.optimized) {
      return JSON.stringify(queryPlan.optimized).indexOf('"ALL"') > -1;
    }
    return false;
  };

  const handleOpen = async () => {
    try {
      setVisible(true);
      setLoading(true);

      const { data } = await axios.post(
        `${API_BASE}/platform-api/stream-data/query-plan`,
        {
          condition: configDefinition.condition,
          entityClass: configDefinition.requestClass,
          aliasDefs: configDefinition.aliasDefs || [],
        }
      );

      setQueryPlan(data);
    } catch (error: any) {
      console.error('Failed to load query plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button icon={<EyeOutlined />} onClick={handleOpen}>
        Query Plan
      </Button>

      <Modal
        title="Query Plan"
        open={visible}
        onCancel={() => setVisible(false)}
        width="90%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {queryPlan.optimized && (
              <>
                {isReportSpeedSlow() ? (
                  <Alert
                    message="Will be done full table scan (Very slow)"
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                ) : (
                  <Alert
                    message="Report will use indexes and execute quickly"
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
              </>
            )}

            <div className="query-plan-view-selector">
              <Radio.Group
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="optimized">Optimized</Radio.Button>
                <Radio.Button value="original">Original</Radio.Button>
              </Radio.Group>
            </div>

            {viewType === 'optimized' && queryPlan.optimized && (
              <QueryPlanDetail
                queryPlan={queryPlan.optimized}
                title="Optimized"
                description="Some conditions Cyoda platform can optimize and this condition will be executed"
              />
            )}

            {viewType === 'original' && queryPlan.original && (
              <QueryPlanDetail
                queryPlan={queryPlan.original}
                title="Original"
                description="This condition shown as it is and before optimization"
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default QueryPlanButton;

