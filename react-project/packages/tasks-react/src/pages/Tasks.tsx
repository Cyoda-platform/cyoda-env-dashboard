/**
 * Tasks Page
 * Main tasks list page with filters and grid
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/Tasks.vue
 */

import React, { useState, useCallback } from 'react';
import { Button, Card } from 'antd';
import { CloseOutlined, ApiOutlined } from '@ant-design/icons';
import { TasksFilter } from '../components/TasksFilter';
import { TasksGrid } from '../components/TasksGrid';
import { useTasksState } from '../hooks/useTasks';
import type { TaskFilterType } from '../types';

export const Tasks: React.FC = () => {
  const { isApplyRealData, setIsApplyRealData } = useTasksState();
  const [filter, setFilter] = useState<TaskFilterType>({});

  const handleChangeFilter = useCallback((filterValue: TaskFilterType) => {
    console.log('📝 Tasks page received filter:', filterValue);
    setFilter(filterValue);
  }, []);

  const toggleApplyRealData = useCallback(() => {
    setIsApplyRealData(!isApplyRealData);
  }, [isApplyRealData, setIsApplyRealData]);

  return (
    <main id="main-content" role="main">
      <div className="row">
        <div className="col-md-12">
          <Card bordered={false}>
            <div className="actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2>Filters</h2>
              </div>
              <div>
                {isApplyRealData ? (
                  <Button
                    type="default"
                    danger
                    icon={<CloseOutlined />}
                    onClick={toggleApplyRealData}
                    aria-label="Unsubscribe from live data updates"
                    aria-pressed="true"
                  >
                    Unsubscribe to live data
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<ApiOutlined />}
                    onClick={toggleApplyRealData}
                    aria-label="Subscribe to live data updates"
                    aria-pressed="false"
                  >
                    Subscribe to live data
                  </Button>
                )}
              </div>
            </div>
            <TasksFilter onChangeFilter={handleChangeFilter} />
            <TasksGrid isApplyRealData={isApplyRealData} filter={filter} />
          </Card>
        </div>
      </div>
    </main>
  );
};

