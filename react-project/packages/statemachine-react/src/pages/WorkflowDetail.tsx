/**
 * Workflow Detail Page
 * View and edit workflow with transitions, processes, and criteria
 * Migrated from: .old_project/packages/statemachine/src/views/workflow/WorkflowId.vue
 */

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, Radio, Divider, Space } from 'antd';
import { TableOutlined, ApartmentOutlined, SettingOutlined } from '@ant-design/icons';
import { WorkflowForm } from '../components/WorkflowForm';
import { TransitionsList } from '../components/TransitionsList';
import { ProcessesList } from '../components/ProcessesList';
import { CriteriaList } from '../components/CriteriaList';
import { GraphicalStateMachine } from '../components/GraphicalStateMachine';
import { useWorkflow, useTransitions, useProcesses, useCriteria } from '../hooks/useStatemachine';
import { useGraphicalStatemachineStore } from '../stores/graphicalStatemachineStore';
import type { PersistedType } from '../types';

type LayoutMode = 'tabular' | 'graphical' | 'config';

export const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams] = useSearchParams();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('tabular');

  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';

  // Fetch data for graphical view
  const { data: workflow } = useWorkflow(persistedType, workflowId || '', !!workflowId);
  const { data: transitions = [] } = useTransitions(persistedType, workflowId || '', !!workflowId);
  const { data: processes = [] } = useProcesses(persistedType, workflowId || '', !!workflowId);
  const { data: criteria = [] } = useCriteria(persistedType, workflowId || '', !!workflowId);

  // Graphical state machine store
  const { positionsMap, updatePositionsMap } = useGraphicalStatemachineStore();

  if (!workflowId) {
    return <div>Workflow ID is required</div>;
  }
  
  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Workflow Form */}
          <WorkflowForm
            workflowId={workflowId}
            persistedType={persistedType}
          />
          
          <Divider />
          
          {/* Layout Mode Selector */}
          <div style={{ textAlign: 'center' }}>
            <Radio.Group
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              size="large"
              buttonStyle="solid"
            >
              <Radio.Button value="tabular">
                <TableOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
              <Radio.Button value="graphical">
                <ApartmentOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
              <Radio.Button value="config">
                <SettingOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
            </Radio.Group>
          </div>
          
          {/* Tabular View */}
          {layoutMode === 'tabular' && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <TransitionsList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
              
              <Divider />
              
              <ProcessesList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
              
              <Divider />
              
              <CriteriaList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
            </Space>
          )}
          
          {/* Graphical View */}
          {layoutMode === 'graphical' && (
            <GraphicalStateMachine
              workflowId={workflowId}
              transitions={transitions}
              processes={processes}
              criteria={criteria}
              positionsMap={positionsMap}
              onUpdatePositionsMap={updatePositionsMap}
              minHeight="600px"
            />
          )}
          
          {/* Config View */}
          {layoutMode === 'config' && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              <SettingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Workflow configuration view coming soon...</div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default WorkflowDetail;

