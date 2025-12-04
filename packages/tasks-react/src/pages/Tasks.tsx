/**
 * Tasks Page
 * Main tasks list page with filters and grid
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/Tasks.vue
 */

import React, { useState, useCallback } from 'react';
import { Button, Card, Typography } from 'antd';
import { SyncOutlined, StopOutlined } from '@ant-design/icons';
import { TasksFilter } from '../components/TasksFilter';
import { TasksGrid } from '../components/TasksGrid';
import { useTasksState } from '../hooks/useTasks';
import type { TaskFilterType } from '../types';
import './Tasks.scss';

const { Title } = Typography;

export const Tasks: React.FC = () => {
  const [filter, setFilter] = useState<TaskFilterType>({});
  const { isApplyRealData, setIsApplyRealData } = useTasksState();

  const handleChangeFilter = useCallback((filterValue: TaskFilterType) => {
    setFilter(filterValue);
  }, []);

  const toggleApplyRealData = useCallback(() => {
    setIsApplyRealData(!isApplyRealData);
  }, [isApplyRealData, setIsApplyRealData]);

  return (
    <div className="tasks-page">
      <Card>
        <div className="tasks-header">
          <Title level={4} style={{ margin: 0 }}>Filters</Title>
          <div className="tasks-actions">
            {isApplyRealData ? (
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                onClick={toggleApplyRealData}
              >
                Unsubscribe to live data
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={toggleApplyRealData}
              >
                Subscribe to live data
              </Button>
            )}
          </div>
        </div>
        <TasksFilter onChangeFilter={handleChangeFilter} />
        <TasksGrid filter={filter} isApplyRealData={isApplyRealData} />
      </Card>
    </div>
  );
};

