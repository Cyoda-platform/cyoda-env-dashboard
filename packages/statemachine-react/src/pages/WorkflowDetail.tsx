/**
 * Workflow Detail Page
 * View and edit workflow with transitions, processes, and criteria
 * Migrated from: .old_project/packages/statemachine/src/views/workflow/WorkflowId.vue
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Divider, Space, Button } from 'antd';
import { TableOutlined, ApartmentOutlined, SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { WorkflowForm } from '../components/WorkflowForm';
import { TransitionsList } from '../components/TransitionsList';
import { ProcessesList } from '../components/ProcessesList';
import { CriteriaList } from '../components/CriteriaList';
import { GraphicalStateMachine } from '../components/GraphicalStateMachine';
import { ConfigWorkflow } from '../components/ConfigWorkflow';
import { useWorkflow, useTransitions, useProcesses, useCriteriaForWorkflow, useStatesList } from '../hooks/useStatemachine';
import { useGraphicalStatemachineStore } from '../stores/graphicalStatemachineStore';
import type { PersistedType } from '../types';

type LayoutMode = 'tabular' | 'graphical' | 'config';

export const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('tabular');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';

  const isNew = !workflowId || workflowId === 'new';

  // Detect theme from data-theme attribute
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    setCurrentTheme(theme || 'dark');

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      setCurrentTheme(newTheme || 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch data for graphical view (only if not creating new)
  const { data: workflow } = useWorkflow(persistedType, workflowId || '', !!workflowId && !isNew);
  const { data: transitions = [] } = useTransitions(persistedType, workflowId || '', !!workflowId && !isNew);
  const { data: processes = [] } = useProcesses(persistedType, workflowId || '', entityClassName, !!workflowId && !isNew);
  const { data: criteria = [] } = useCriteriaForWorkflow(persistedType, workflowId || '', entityClassName, !!workflowId && !isNew);
  const { data: states = [] } = useStatesList(persistedType, workflowId || '', !!workflowId && !isNew);

  // Graphical state machine store
  const { positionsMap, updatePositionsMap } = useGraphicalStatemachineStore();

  // Create a map of state IDs to state names for quick lookup
  const statesMap = useMemo(() => {
    const map = new Map<string, string>();
    states.forEach((state: any) => {
      map.set(state.id, state.name);
    });
    return map;
  }, [states]);

  // Enrich transitions with state names
  const enrichedTransitions = useMemo(() => {
    return transitions.map((transition: any) => {
      const startStateId = transition.startStateId || transition.fromState;
      const endStateId = transition.endStateId || transition.toState;

      return {
        ...transition,
        startStateName: transition.startStateName ||
          (startStateId === 'noneState' ? 'None' : statesMap.get(startStateId)) ||
          'None',
        endStateName: transition.endStateName ||
          statesMap.get(endStateId) ||
          'None',
      };
    });
  }, [transitions, statesMap]);

  // Handler for adding new transition from graphical view
  const handleAddTransition = () => {
    navigate(
      `/transition/new?workflowId=${workflowId}&persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/workflows')}
        >
          Back to Workflows
        </Button>
      </div>

      <Card variant="borderless">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Workflow Form */}
          <WorkflowForm
            workflowId={workflowId}
            persistedType={persistedType}
          />

          {/* Only show layout selector and lists for existing workflows */}
          {!isNew && (
            <>
              <Divider />

              {/* Layout Mode Selector */}
              <div style={{ textAlign: 'center' }}>
                <Radio.Group
                  value={layoutMode}
                  onChange={(e) => setLayoutMode(e.target.value)}
                  size="large"
                  buttonStyle="solid"
                  style={{
                    display: 'inline-flex',
                    gap: '0',
                  }}
                >
                  <Radio.Button
                    value="tabular"
                    style={{
                      borderColor: layoutMode === 'tabular' ? '#14b8a6' : '#d9d9d9',
                      color: '#ffffff',
                      backgroundColor: layoutMode === 'tabular' ? '#14b8a6' : 'transparent',
                    }}
                  >
                    <TableOutlined style={{
                      fontSize: '22px',
                      color: layoutMode === 'tabular' ? '#ffffff' : (currentTheme === 'light' ? '#595959' : '#ffffff')
                    }} />
                  </Radio.Button>
                  <Radio.Button
                    value="graphical"
                    style={{
                      borderColor: layoutMode === 'graphical' ? '#14b8a6' : '#d9d9d9',
                      color: '#ffffff',
                      backgroundColor: layoutMode === 'graphical' ? '#14b8a6' : 'transparent',
                    }}
                  >
                    <ApartmentOutlined style={{
                      fontSize: '22px',
                      color: layoutMode === 'graphical' ? '#ffffff' : (currentTheme === 'light' ? '#595959' : '#ffffff')
                    }} />
                  </Radio.Button>
                  <Radio.Button
                    value="config"
                    style={{
                      borderColor: layoutMode === 'config' ? '#14b8a6' : '#d9d9d9',
                      color: '#ffffff',
                      backgroundColor: layoutMode === 'config' ? '#14b8a6' : 'transparent',
                    }}
                  >
                    <SettingOutlined style={{
                      fontSize: '22px',
                      color: layoutMode === 'config' ? '#ffffff' : (currentTheme === 'light' ? '#595959' : '#ffffff')
                    }} />
                  </Radio.Button>
                </Radio.Group>
              </div>
          
              {/* Tabular View */}
              {layoutMode === 'tabular' && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <TransitionsList
                    workflowId={workflowId!}
                    persistedType={persistedType}
                    entityClassName={entityClassName}
                  />

                  <Divider />

                  <ProcessesList
                    workflowId={workflowId!}
                    persistedType={persistedType}
                    entityClassName={entityClassName}
                  />

                  <Divider />

                  <CriteriaList
                    workflowId={workflowId!}
                    persistedType={persistedType}
                    entityClassName={entityClassName}
                  />
                </Space>
              )}

              {/* Graphical View */}
              {layoutMode === 'graphical' && (
                <GraphicalStateMachine
                  workflowId={workflowId!}
                  transitions={enrichedTransitions}
                  processes={processes}
                  criteria={criteria}
                  positionsMap={positionsMap}
                  onUpdatePositionsMap={updatePositionsMap}
                  onAddTransition={handleAddTransition}
                  isReadonly={persistedType === 'runtime'}
                  minHeight="600px"
                />
              )}

              {/* Config View */}
              {layoutMode === 'config' && (
                <ConfigWorkflow
                  workflowId={workflowId!}
                  persistedType={persistedType}
                />
              )}
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default WorkflowDetail;

