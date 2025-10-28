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
import './GraphicalStateMachine.scss';
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
      console.log('[GraphicalStateMachine] Skipping init - already initialized or no container');
      return;
    }

    // Check if container has dimensions
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('[GraphicalStateMachine] Container has no dimensions, retrying...', {
        width: containerWidth,
        height: containerHeight
      });
      // Retry after a short delay
      setTimeout(() => {
        setIsInitialized(false);
        init();
      }, 100);
      return;
    }

    console.log('[GraphicalStateMachine] Initializing with:', {
      transitions: transitions.length,
      activeTransitions: activeTransitions.length,
      processes: processes.length,
      criteria: criteria.length,
      positionsMap,
    });

    console.log('[GraphicalStateMachine] Active transitions data:', activeTransitions.map(t => ({
      id: t.id,
      name: t.name,
      startStateId: t.startStateId,
      startStateName: t.startStateName,
      endStateId: t.endStateId,
      endStateName: t.endStateName,
      active: t.active,
    })));

    const elements = getStatesTransitionsEles(activeTransitions, positionsMap, currentState);

    // Set background color on container before initializing Cytoscape
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = '#1f2937'; // Dark theme background
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style,
      layout: positionsMap ? { name: 'preset' } : {
        name: 'breadthfirst',
        directed: true,
        nodeDimensionsIncludeLabels: true,
        padding: 50,
        fit: true,
        avoidOverlap: true,
      },
      zoom: 1,
      pan: { x: 0, y: 0 },
      minZoom: 0.1,
      maxZoom: 4,
    });

    // Force resize immediately after initialization
    cy.resize();

    cyRef.current = cy;

    // Force background color on the canvas element after Cytoscape renders
    setTimeout(() => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
          (canvas as HTMLCanvasElement).style.backgroundColor = '#1f2937'; // Dark theme
        }
        // Also set on all child divs
        const divs = containerRef.current.querySelectorAll('div');
        divs.forEach((div) => {
          (div as HTMLElement).style.backgroundColor = '#1f2937'; // Dark theme
        });
      }
    }, 100);

    // Add criteria and processes
    addCriteria();
    addProcesses();

    // Save positions if no saved positions exist
    if (!positionsMap) {
      const eles = cy.nodes();
      setPositions(eles);
    }

    // Mark as initialized
    setIsInitialized(true);

    // Event handlers
    cy.on('tap', 'node, edge', onEleSelect);
    cy.on('dragfree', 'node', onDragFree);
    cy.on('tap', onTapBackground);

    cy.userZoomingEnabled(false);

    // Set initialized flag (will be set after layout completes if no positionsMap)
    if (!positionsMap) {
      // Apply initial visibility settings for new layouts
      cy.nodes().toggleClass('hide-titles', !showTitles);
      cy.edges().toggleClass('hide-titles-edge', !showEdgesTitles);
      cy.nodes('.compound-processes').toggleClass('hidden', !showProcesses);
      cy.edges('.edge-process').toggleClass('hidden', !showProcesses);
      cy.nodes('.node-criteria').toggleClass('hidden', !showCriteria);
      cy.nodes('.compound-criteria').toggleClass('compound-criteria-hidden', !showCriteria);
    }
  }, [activeTransitions, positionsMap, currentState, isInitialized, processes, criteria, showTitles, showEdgesTitles, showProcesses, showCriteria]);

  // Force canvas background color after initialization
  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    const forceBackgroundColor = () => {
      if (!containerRef.current) return;

      // Set background on container
      containerRef.current.style.backgroundColor = '#1f2937'; // Dark theme

      // Set background on all child elements
      const allElements = containerRef.current.querySelectorAll('*');
      allElements.forEach((el) => {
        (el as HTMLElement).style.backgroundColor = '#1f2937'; // Dark theme
      });

      // Specifically target canvas
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        (canvas as HTMLCanvasElement).style.backgroundColor = '#1f2937'; // Dark theme
      }
    };

    // Run immediately and after a delay to ensure it takes effect
    forceBackgroundColor();
    const timer = setTimeout(forceBackgroundColor, 100);

    return () => clearTimeout(timer);
  }, [isInitialized]);

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

  // Initialize on mount and when data changes
  useEffect(() => {
    // Only initialize if we have transitions data
    if (transitions.length > 0 && !isInitialized) {
      console.log('[GraphicalStateMachine] useEffect - calling init');
      init();
    }
  }, [transitions, isInitialized, init]);

  // Reinitialize when workflow changes
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        console.log('[GraphicalStateMachine] Cleanup - destroying cytoscape');
        cyRef.current.destroy();
        cyRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [workflowId]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Resize canvas when entering/exiting fullscreen
      if (cyRef.current) {
        setTimeout(() => {
          cyRef.current?.resize();
          cyRef.current?.fit(undefined, 50);
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
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
              <Button
                icon={<AimOutlined />}
                onClick={fitGraph}
                title="Fit to screen"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ZoomInOutlined />}
                onClick={zoomIn}
                title="Zoom in"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ZoomOutOutlined />}
                onClick={zoomOut}
                title="Zoom out"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={panLeft}
                title="Pan left"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ArrowRightOutlined />}
                onClick={panRight}
                title="Pan right"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ArrowUpOutlined />}
                onClick={panTop}
                title="Pan up"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={<ArrowDownOutlined />}
                onClick={panBottom}
                title="Pan down"
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
              />
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
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

