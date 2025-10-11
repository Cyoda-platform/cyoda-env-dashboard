/**
 * Graphical State Machine Component
 * Visual workflow editor using Cytoscape.js
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/GraphicalStatemachineMap.vue
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import { Button, Space, Card } from 'antd';
import { 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  AimOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { GraphicalStateMachinePanel } from '@cyoda/ui-lib-react';
import type { Transition, Process, Criteria, PositionsMap } from '../../types';
import { style } from './style';
import { coreLayout, childrenLayout } from './layouts';
import { 
  getStatesTransitionsEles, 
  getProcessesEles, 
  getCriteriaEles,
  positionBetween,
  fillPositionsMap,
  NONE_STATE_ID 
} from './utils';
import './GraphicalStateMachine.scss';

export interface GraphicalStateMachineProps {
  workflowId: string;
  transitions: Transition[];
  processes: Process[];
  criteria: Criteria[];
  positionsMap?: PositionsMap | null;
  currentState?: string;
  isReadonly?: boolean;
  minHeight?: string;
  onUpdatePositionsMap?: (positionsMap: PositionsMap) => void;
  onSelectElement?: (element: { type: string; id: string; title: string; persisted: boolean }) => void;
}

export const GraphicalStateMachine: React.FC<GraphicalStateMachineProps> = ({
  workflowId,
  transitions,
  processes,
  criteria,
  positionsMap = null,
  currentState = '',
  isReadonly = false,
  minHeight = '100vh',
  onUpdatePositionsMap,
  onSelectElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProcesses, setShowProcesses] = useState(true);
  const [showCriteria, setShowCriteria] = useState(true);
  const [showTitles, setShowTitles] = useState(true);
  const [showEdgesTitles, setShowEdgesTitles] = useState(false);
  const [showListOfTransitions, setShowListOfTransitions] = useState(true);

  // Filter active transitions
  const activeTransitions = transitions.filter((t) => t.active);

  // Initialize Cytoscape
  const init = useCallback(() => {
    if (isInitialized || !containerRef.current) {
      return;
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: getStatesTransitionsEles(activeTransitions, positionsMap, currentState),
      layout: coreLayout('breadthfirst'),
      style,
      zoom: 1,
      pan: { x: 0, y: 0 },
      minZoom: 0.1,
      maxZoom: 4,
    });

    cyRef.current = cy;

    // Add criteria and processes
    addCriteria();
    addProcesses();

    const eles = cy.nodes();
    if (!positionsMap) {
      setPositions(eles);
    }

    // Event handlers
    cy.on('tap', 'node, edge', onEleSelect);
    cy.on('dragfree', 'node', onDragFree);
    cy.on('tap', onTapBackground);

    cy.fit();
    cy.userZoomingEnabled(false);
    setIsInitialized(true);

    // Apply initial visibility settings
    cy.nodes().toggleClass('hide-titles', !showTitles);
    cy.edges().toggleClass('hide-titles-edge', !showEdgesTitles);
    cy.nodes('.compound-processes').toggleClass('hidden', !showProcesses);
    cy.edges('.edge-process').toggleClass('hidden', !showProcesses);
    cy.nodes('.node-criteria').toggleClass('hidden', !showCriteria);
    cy.nodes('.compound-criteria').toggleClass('compound-criteria-hidden', !showCriteria);
  }, [activeTransitions, positionsMap, currentState, isInitialized]);

  // Add processes to the graph
  const addProcesses = useCallback(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const transitions = cy.edges('.edge').filter((edge: any) => !edge.hasClass('edge-process'));

    transitions.forEach((transitionEdge: any) => {
      const transitionId = transitionEdge.data('entityId');
      const transition = activeTransitions.find((t) => t.id === transitionId);

      if (!transition || !transition.endProcessesIds.length) {
        return;
      }

      const endStateEle = cy.getElementById(transition.endStateId);
      const processesEles = getProcessesEles({
        transition,
        endStateEle,
        positionsMap: positionsMap || {},
        processesList: processes,
        transitionEdge,
      });

      if (processesEles.source) {
        cy.add(processesEles.source);
        cy.add(processesEles.parent);
        cy.add(processesEles.edge);
        processesEles.children.forEach((child: any) => cy.add(child));
      }
    });
  }, [activeTransitions, processes, positionsMap]);

  // Add criteria to the graph
  const addCriteria = useCallback(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const transitions = cy.edges('.edge').filter((edge: any) => !edge.hasClass('edge-process'));

    transitions.forEach((transitionEdge: any) => {
      const transitionId = transitionEdge.data('entityId');
      const transition = activeTransitions.find((t) => t.id === transitionId);

      if (!transition || !transition.criteriaIds.length) {
        return;
      }

      const startStateEle = cy.getElementById(transition.startStateId);
      const endStateEle = cy.getElementById(transition.endStateId);
      const position = positionBetween(startStateEle.position(), endStateEle.position());

      const criteriaEles = getCriteriaEles({
        transition,
        criteriaList: criteria,
        position,
      });

      cy.add(criteriaEles.parent);
      criteriaEles.children.forEach((child: any) => cy.add(child));
    });
  }, [activeTransitions, criteria]);

  // Set positions and save to store
  const setPositions = useCallback((eles: any) => {
    if (!cyRef.current) return;

    const positions = fillPositionsMap(eles);
    if (onUpdatePositionsMap) {
      onUpdatePositionsMap(positions);
    }
  }, [onUpdatePositionsMap]);

  // Handle element selection
  const onEleSelect = useCallback((e: any) => {
    if (isReadonly) return;
    
    e.target.unselect();
    const { type, title, fullTitle, entityId, persisted } = e.target.data();

    if (type === 'state' || type === 'process' || type === 'criteria') {
      if (onSelectElement) {
        onSelectElement({
          type,
          id: entityId,
          title: fullTitle || title,
          persisted,
        });
      }
    }
  }, [isReadonly, onSelectElement]);

  // Handle drag end
  const onDragFree = useCallback(() => {
    if (!cyRef.current) return;
    const eles = cyRef.current.nodes();
    setPositions(eles);
  }, [setPositions]);

  // Handle background tap
  const onTapBackground = useCallback((e: any) => {
    if (e.target === cyRef.current) {
      // Clicked on background
    }
  }, []);

  // Reset positions
  const resetPositions = useCallback((isSaveState = true) => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const layout = cy.layout(coreLayout('breadthfirst'));
    layout.run();

    if (isSaveState) {
      const eles = cy.nodes();
      setPositions(eles);
    }

    cy.fit();
  }, [setPositions]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const zoomOut = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  const fitGraph = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  }, []);

  // Pan controls
  const panLeft = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x + 50, y: pan.y });
  }, []);

  const panRight = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x - 50, y: pan.y });
  }, []);

  const panTop = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x, y: pan.y + 50 });
  }, []);

  const panBottom = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x, y: pan.y - 50 });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!isFullscreen) {
      if (wrapperRef.current.requestFullscreen) {
        wrapperRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Toggle visibility functions
  const toggleProcesses = useCallback(() => {
    setShowProcesses((prev) => !prev);
    if (cyRef.current) {
      cyRef.current.nodes('.compound-processes').toggleClass('hidden');
      cyRef.current.edges('.edge-process').toggleClass('hidden');
    }
  }, []);

  const toggleCriteria = useCallback(() => {
    setShowCriteria((prev) => !prev);
    if (cyRef.current) {
      cyRef.current.nodes('.node-criteria').toggleClass('hidden');
      cyRef.current.nodes('.compound-criteria').toggleClass('compound-criteria-hidden');
    }
  }, []);

  const toggleTitles = useCallback(() => {
    setShowTitles((prev) => !prev);
    if (cyRef.current) {
      cyRef.current.nodes().toggleClass('hide-titles');
    }
  }, []);

  const toggleEdgesTitles = useCallback(() => {
    setShowEdgesTitles((prev) => !prev);
    if (cyRef.current) {
      cyRef.current.edges().toggleClass('hide-titles-edge');
    }
  }, []);

  const toggleListOfTransitions = useCallback(() => {
    setShowListOfTransitions((prev) => !prev);
  }, []);

  // Initialize on mount
  useEffect(() => {
    init();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []);

  // Reinitialize when data changes
  useEffect(() => {
    if (isInitialized && cyRef.current) {
      cyRef.current.destroy();
      setIsInitialized(false);
      init();
    }
  }, [workflowId, transitions, processes, criteria]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className={`graphical-statemachine-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
    >
      <div className="graphical-statemachine" style={{ minHeight }}>
        {/* Control Panel */}
        <div className="panel">
          <GraphicalStateMachinePanel
            showProcesses={showProcesses}
            showCriteria={showCriteria}
            showTitles={showTitles}
            showEdgesTitles={showEdgesTitles}
            showListOfTransitions={showListOfTransitions}
            onToggleProcesses={toggleProcesses}
            onToggleCriteria={toggleCriteria}
            onToggleTitles={toggleTitles}
            onToggleEdgesTitles={toggleEdgesTitles}
            onToggleListOfTransitions={toggleListOfTransitions}
            onResetPositions={() => resetPositions(true)}
          />
        </div>

        {/* Graph Container */}
        <div className="graph-wrapper">
          <div ref={containerRef} className="graph-container" />
          
          {/* Map Controls */}
          <div className="map-controls">
            <Space direction="vertical">
              <Button icon={<AimOutlined />} onClick={fitGraph} title="Fit to screen" />
              <Button icon={<ZoomInOutlined />} onClick={zoomIn} title="Zoom in" />
              <Button icon={<ZoomOutOutlined />} onClick={zoomOut} title="Zoom out" />
              <Button icon={<ArrowLeftOutlined />} onClick={panLeft} title="Pan left" />
              <Button icon={<ArrowRightOutlined />} onClick={panRight} title="Pan right" />
              <Button icon={<ArrowUpOutlined />} onClick={panTop} title="Pan up" />
              <Button icon={<ArrowDownOutlined />} onClick={panBottom} title="Pan down" />
              <Button 
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              />
            </Space>
          </div>

          {/* Legend */}
          <div className="map-legend">
            <Card size="small" title="Legend">
              <Space direction="vertical" size="small">
                <div><span className="legend-circle state" /> State</div>
                <div><span className="legend-circle current-state" /> Current State</div>
                <div><span className="legend-diamond" /> Criteria</div>
                <div><span className="legend-heptagon" /> Process</div>
                <div><span className="legend-line automated" /> Automated Transition</div>
                <div><span className="legend-line manual" /> Manual Transition</div>
              </Space>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalStateMachine;

