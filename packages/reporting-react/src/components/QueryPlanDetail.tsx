/**
 * QueryPlanDetail Component
 * Shows detailed query plan information with Cassandra queries
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/FilterBuilder/QueryPlan/FilterBuilderQueryPlanDetail.vue
 */

import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { QueryPlanDetailRaw, HelperFormat } from '@cyoda/ui-lib-react';
import './QueryPlanDetail.scss';

interface QueryCondition {
  type: string;
  conditions: string[];
  indexId?: string;
  indexValuesJson?: string;
}

interface QueryPlanDetailProps {
  queryPlan: any;
  title: string;
  description: string;
}

export const QueryPlanDetail: React.FC<QueryPlanDetailProps> = ({
  queryPlan,
  title,
  description,
}) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [rawModalVisible, setRawModalVisible] = useState(false);

  useEffect(() => {
    const newConditions: QueryCondition[] = [];
    
    const collectAllConditions = (obj: any) => {
      if (obj && typeof obj === 'object') {
        if ('conditions' in obj) {
          newConditions.push(obj);
        } else {
          Object.keys(obj).forEach((key) => {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((arrItem: any) => collectAllConditions(arrItem));
            } else if (typeof obj[key] === 'object') {
              collectAllConditions(obj[key]);
            }
          });
        }
      }
    };

    collectAllConditions(queryPlan);
    setConditions(newConditions);
  }, [queryPlan]);

  const displayCondition = (item: string): string => {
    return HelperFormat.shortNamePath(item);
  };

  const parseIndexValues = (indexValuesJson: string): string => {
    try {
      const parsed = JSON.parse(indexValuesJson);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
      return String(parsed);
    } catch {
      return indexValuesJson;
    }
  };

  return (
    <div className="query-plan-detail">
      <div className="query-plan-detail__header">
        <h2>
          {title}
          <Tooltip title={description} placement="topLeft">
            <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14 }} />
          </Tooltip>
        </h2>
        <div>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setRawModalVisible(true)}
          >
            View Raw
          </Button>
        </div>
      </div>

      <h3>Queries to cassandra</h3>

      {conditions.length > 0 ? (
        conditions.map((condition, index) => (
          <div key={index} className="query-plan-detail__row">
            <div className="query-plan-detail__type">
              <label>Type</label>
              <div>{condition.type}</div>
            </div>
            <div className="query-plan-detail__condition">
              <label>Conditions</label>
              {condition.conditions?.map((item, idx) => (
                <div key={idx}>{displayCondition(item)}</div>
              ))}
            </div>
            <div className="query-plan-detail__index-id">
              <label>IndexId</label>
              <div>{condition.indexId || '-'}</div>
            </div>
            <div className="query-plan-detail__index-values">
              <label>indexValuesJson</label>
              <div>
                {condition.indexValuesJson
                  ? parseIndexValues(condition.indexValuesJson)
                  : '-'}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No queries</div>
      )}

      <QueryPlanDetailRaw
        queryPlan={queryPlan}
        title={title}
        visible={rawModalVisible}
        onClose={() => setRawModalVisible(false)}
      />
    </div>
  );
};

export default QueryPlanDetail;

