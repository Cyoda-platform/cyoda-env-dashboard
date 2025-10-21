/**
 * FilterBuilderQueryPlan Component
 * Shows query execution plan for filter conditions
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlan.vue
 */

import React, { useState } from 'react';
import { Button, Modal, Alert, Radio, Spin } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { ReportDefinition } from '../types';
import './FilterBuilderQueryPlan.scss';

interface FilterBuilderQueryPlanProps {
  configDefinition: ReportDefinition;
  disabled?: boolean;
}

interface QueryPlan {
  optimized?: any;
  original?: any;
}

const FilterBuilderQueryPlan: React.FC<FilterBuilderQueryPlanProps> = ({
  configDefinition,
  disabled = false,
}) => {
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

  const handleRunExecutionPlan = async () => {
    try {
      setVisible(true);
      setLoading(true);

      const { data } = await axios.post('/platform-api/stream-data/query-plan', {
        condition: configDefinition.condition,
        entityClass: configDefinition.requestClass,
        aliasDefs: configDefinition.aliasDefs || [],
      });

      setQueryPlan(data);
    } catch (error: any) {
      console.error('Failed to load query plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderQueryPlanDetail = (plan: any, title: string, description: string) => {
    if (!plan) return null;

    return (
      <div className="query-plan-detail">
        <h3>{title}</h3>
        <p className="description">{description}</p>
        <pre className="query-plan-json">
          {JSON.stringify(plan, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <>
      <Button
        type="default"
        icon={<ThunderboltOutlined />}
        onClick={handleRunExecutionPlan}
        disabled={disabled}
        className="query-plan-button"
      >
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

            <div className="view-type-selector">
              <Radio.Group
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="optimized">Optimized</Radio.Button>
                <Radio.Button value="original">Original</Radio.Button>
              </Radio.Group>
            </div>

            {viewType === 'optimized' &&
              renderQueryPlanDetail(
                queryPlan.optimized,
                'Optimized',
                'Some conditions Cyoda platform can optimize and this condition will be executed'
              )}

            {viewType === 'original' &&
              renderQueryPlanDetail(
                queryPlan.original,
                'Original',
                'This condition shown as it is and before optimization'
              )}
          </>
        )}
      </Modal>
    </>
  );
};

export default FilterBuilderQueryPlan;

