/**
 * Graphical State Machine Component
 * Visual workflow editor using Cytoscape.js
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/GraphicalStatemachineMap.vue
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { Button, Space, Card, Table } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, PlusOutlined } from '@ant-design/icons';
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
import { getStyleForTheme } from './style';
import { coreLayout } from './layouts';
import './GraphicalStateMachine.scss';
import {
  getStatesTransitionsEles,
  getProcessesEles,
  getCriteriaEles,
  positionBetween,
  fillPositionsMap,
} from './utils';

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
  onAddTransition?: () => void;
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
  onAddTransition,
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
  const [hiddenTransitions, setHiddenTransitions] = useState<Set<string>>(new Set());
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

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

  // Update Cytoscape styles when theme changes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style(getStyleForTheme(currentTheme));
    }
  }, [currentTheme]);

  // Filter active transitions - memoize to prevent re-initialization loop
  const activeTransitions = useMemo(() => transitions.filter((t) => t.active), [transitions]);

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

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: getStyleForTheme(currentTheme),
      layout: positionsMap ? { name: 'preset' } : {
        name: 'breadthfirst',
        directed: true,
        nodeDimensionsIncludeLabels: true,
        padding: 100, // Increased padding for more spacing
        spacingFactor: 1.5, // Extra spacing between nodes
        fit: true,
        avoidOverlap: true, // Prevent nodes from overlapping
        avoidOverlapPadding: 50, // Minimum distance between nodes
      },
      zoom: 1,
      pan: { x: 0, y: 0 }, // Start at origin like Vue version
      minZoom: 0.1,
      maxZoom: 4,
      // Don't set autoungrabify - let it default to false
      // Don't set autounselectify - let it default to false
    });

    // Force resize immediately after initialization
    cy.resize();

    cyRef.current = cy;

    // Listen for layout stop event to fit the graph (matching Vue implementation)
    cy.one('layoutstop', () => {
      setTimeout(() => {
        cy.fit(50);
      }, 50);
    });

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

    // Enable/disable dragging based on readonly mode (matching Vue implementation)
    console.log('[GraphicalStateMachine] isReadonly:', isReadonly);
    if (isReadonly) {
      console.log('[GraphicalStateMachine] Locking nodes');
      cy.nodes('.compound-processes').lock();
      cy.nodes('.node-state').lock();
    } else {
      console.log('[GraphicalStateMachine] Unlocking nodes');
      cy.nodes('.compound-processes').unlock();
      cy.nodes('.node-state').unlock();
      console.log('[GraphicalStateMachine] State nodes unlocked:', cy.nodes('.node-state').length);
      console.log('[GraphicalStateMachine] Process nodes unlocked:', cy.nodes('.compound-processes').length);
    }

    cy.fit();
    // Reduce zoom to 40% to avoid overlapping with the transitions table
    cy.zoom(cy.zoom() * 0.4);
    // Pan to the right and down to center the graph in the visible area (accounting for the table on the left)
    const currentPan = cy.pan();
    cy.pan({ x: currentPan.x + 500, y: currentPan.y + 100 });
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
    } else {
      // If we have saved positions, fit immediately since layout is preset
      setTimeout(() => {
        cy.fit(50);
      }, 100);
    }
  }, [activeTransitions, positionsMap, currentState, isInitialized, processes, criteria, showTitles, showEdgesTitles, showProcesses, showCriteria, isReadonly]);

  // Add processes to the graph
  const addProcesses = useCallback(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    activeTransitions.forEach((transition) => {
      const transitionEdge = cy.getElementById(transition.id);
      const startStateEle = cy.getElementById(transition.startStateId || '');
      const endStateEle = cy.getElementById(transition.endStateId || '');

      const processesEles = getProcessesEles({
        transition,
        endStateEle,
        positionsMap: positionsMap || {},
        processesList: processes,
        transitionEdge,
      });

      if (!processesEles.parent || !processesEles.children || !processesEles.edge) {
        return;
      }

      const sourceEle = cy.add(processesEles.source);
      const processesCompoundEle = cy.add(processesEles.parent);
      cy.add(processesEles.edge);
      processesEles.children.forEach((child: any) => cy.add(child));

      // Layout children and position
      processesCompoundEle.children().layout({
        name: 'grid',
        rows: 1,
        padding: 5,
      });

      if (processesEles.position) {
        processesCompoundEle.position(processesEles.position);
      }

      // Reposition source element to transition edge target endpoint
      const repositionProcesses = () => {
        try {
          const tEdge = cy.getElementById(transition.id);
          if (tEdge && tEdge.length > 0 && tEdge.targetEndpoint) {
            const endpoint = tEdge.targetEndpoint();
            if (endpoint) {
              sourceEle.position(endpoint);
            }
          }
        } catch (error) {
          // Silently ignore errors during process repositioning
        }
      };

      setTimeout(repositionProcesses, 0);

      // Attach position event handlers to reposition processes when nodes move
      startStateEle.on('position', repositionProcesses);
      endStateEle.on('position', repositionProcesses);

      // Apply hidden class if processes are not shown
      if (!showProcesses) {
        cy.nodes('.compound-processes').addClass('hidden');
        cy.edges('.edge-process').addClass('hidden');
      }
    });
  }, [activeTransitions, processes, positionsMap, showProcesses]);

  // Add criteria to the graph
  const addCriteria = useCallback(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    activeTransitions.forEach((transition) => {
      if (!transition.criteriaIds || !transition.criteriaIds.length) {
        return;
      }

      const edge = cy.getElementById(transition.id);
      const startStateEle = edge.source();
      const endStateEle = edge.target();
      const position = edge.midpoint();

      const criteriaEles = getCriteriaEles({
        transition,
        criteriaList: criteria,
        position,
      });

      edge.data('compoundCriteria', criteriaEles.criteriaCompoundEleId);
      const criteriaCompoundEle = cy.add(criteriaEles.parent);
      criteriaEles.children.forEach((child: any) => cy.add(child));

      // Layout children
      criteriaCompoundEle.children().layout({
        name: 'grid',
        rows: 1,
        padding: 5,
      });

      // Position criteria at edge midpoint
      setTimeout(() => {
        try {
          const e = cy.getElementById(transition.id);
          if (e && e.length > 0 && e.midpoint) {
            const p = e.midpoint();
            if (p) {
              criteriaCompoundEle.position(p);
            }
          }
        } catch (error) {
          // Silently ignore errors during criteria positioning
          console.warn('Error positioning criteria:', error);
        }
      }, 0);

      // Attach position event handlers to reposition criteria when nodes move
      const repositionCriteria = (e: any) => {
        try {
          if (!e || !e.target) return;
          const edges = e.target.connectedEdges();
          if (!edges) return;

          edges.forEach((edge: any) => {
            try {
              if (!edge || !edge.data) return;
              const criteriaId = edge.data('compoundCriteria');
              if (!criteriaId) return;

              const compoundEle = cy.getElementById(criteriaId);
              if (!compoundEle || compoundEle.length === 0) return;

              if (edge.midpoint && typeof edge.midpoint === 'function') {
                const position = edge.midpoint();
                if (position) {
                  compoundEle.position(position);
                }
              }
            } catch (innerError) {
              // Silently ignore errors for individual edges
            }
          });
        } catch (error) {
          // Silently ignore errors during criteria repositioning
        }
      };
      startStateEle.on('position', repositionCriteria);
      endStateEle.on('position', repositionCriteria);

      // Apply hidden class if criteria are not shown
      if (!showCriteria) {
        cy.nodes('.node-criteria').addClass('hidden');
        cy.nodes('.compound-criteria').addClass('compound-criteria-hidden');
      }
    });
  }, [activeTransitions, criteria, showCriteria]);

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
  const onDragFree = useCallback((event: any) => {
    console.log('[GraphicalStateMachine] onDragFree triggered!', event.target.id());
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const draggedNode = event.target;

    // Check for overlaps and adjust position if needed
    const MIN_DISTANCE = 100; // Minimum distance between node centers
    let hasOverlap = false;

    cy.nodes().forEach((otherNode: any) => {
      if (otherNode.id() === draggedNode.id()) return;

      const draggedPos = draggedNode.position();
      const otherPos = otherNode.position();

      const dx = draggedPos.x - otherPos.x;
      const dy = draggedPos.y - otherPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_DISTANCE) {
        hasOverlap = true;
        // Push the dragged node away from the overlapping node
        const angle = Math.atan2(dy, dx);
        const newX = otherPos.x + Math.cos(angle) * MIN_DISTANCE;
        const newY = otherPos.y + Math.sin(angle) * MIN_DISTANCE;
        draggedNode.position({ x: newX, y: newY });
      }
    });

    const eles = cy.nodes();
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

    // Listen for layout stop to reposition criteria and processes
    cy.one('layoutstop', () => {
      // Reposition all criteria boxes to edge midpoints
      cy.edges().forEach((edge: any) => {
        try {
          const criteriaId = edge.data('compoundCriteria');
          if (criteriaId) {
            const compoundEle = cy.getElementById(criteriaId);
            if (compoundEle && compoundEle.length > 0 && edge.midpoint && typeof edge.midpoint === 'function') {
              const position = edge.midpoint();
              if (position) {
                compoundEle.position(position);
              }
            }
          }
        } catch (error) {
          // Silently ignore errors
        }
      });

      // Reposition all process boxes to edge target endpoints
      cy.edges().forEach((edge: any) => {
        try {
          const processesId = edge.data('compoundProcesses');
          if (processesId) {
            const compoundEle = cy.getElementById(processesId);
            if (compoundEle && compoundEle.length > 0 && edge.targetEndpoint && typeof edge.targetEndpoint === 'function') {
              const endpoint = edge.targetEndpoint();
              if (endpoint) {
                const sourceEle = compoundEle.children('[id$="-source"]');
                if (sourceEle && sourceEle.length > 0) {
                  sourceEle.position(endpoint);
                }
              }
            }
          }
        } catch (error) {
          // Silently ignore errors
        }
      });

      cy.fit();
      // Apply offset to avoid transitions table
      const currentPan = cy.pan();
      cy.pan({ x: currentPan.x + 250, y: currentPan.y });
    });

    layout.run();

    if (isSaveState) {
      const eles = cy.nodes();
      setPositions(eles);
    }
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
    // Apply offset to avoid transitions table
    const currentPan = cyRef.current.pan();
    cyRef.current.pan({ x: currentPan.x + 250, y: currentPan.y });
  }, []);

  // Pan controls
  const panLeft = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x - 50, y: pan.y });
  }, []);

  const panRight = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x + 50, y: pan.y });
  }, []);

  const panTop = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x, y: pan.y - 50 });
  }, []);

  const panBottom = useCallback(() => {
    if (!cyRef.current) return;
    const pan = cyRef.current.pan();
    cyRef.current.pan({ x: pan.x, y: pan.y + 50 });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitions.length, isInitialized]); // Only re-init when transitions count or initialized state changes

  // Cleanup when workflow changes or component unmounts
  useEffect(() => {
    // Cleanup function runs when workflowId changes or component unmounts
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
          cyRef.current?.fit(50);
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
          <div className="wrap-map">
            {/* Transitions List */}
            {showListOfTransitions && (
              <div className="gf-transitions-list" style={{ height: 'auto', minHeight: 'auto' }}>
                <Table
                  size="small"
                  dataSource={activeTransitions.map((t) => ({
                    key: t.id,
                    id: t.id,
                    name: t.name,
                    startState: t.startStateName || 'None',
                    endState: t.endStateName || '',
                    automated: t.automated,
                  }))}
                  columns={[
                    {
                      title: 'Transition',
                      dataIndex: 'name',
                      key: 'name',
                      width: 115,
                      ellipsis: true,
                    },
                    {
                      title: 'Start state',
                      dataIndex: 'startState',
                      key: 'startState',
                      width: 115,
                      ellipsis: true,
                    },
                    {
                      title: 'End state',
                      dataIndex: 'endState',
                      key: 'endState',
                      width: 115,
                      ellipsis: true,
                    },
                    {
                      title: 'View',
                      key: 'view',
                      width: 70,
                      render: (_, record) => (
                        <Button
                          type="text"
                          size="small"
                          icon={hiddenTransitions.has(record.id) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          onClick={() => {
                            const newHidden = new Set(hiddenTransitions);
                            if (newHidden.has(record.id)) {
                              newHidden.delete(record.id);
                              // Show the transition
                              if (cyRef.current) {
                                const edge = cyRef.current.getElementById(record.id);
                                edge.style({ display: 'element' });
                              }
                            } else {
                              newHidden.add(record.id);
                              // Hide the transition
                              if (cyRef.current) {
                                const edge = cyRef.current.getElementById(record.id);
                                edge.style({ display: 'none' });
                              }
                            }
                            setHiddenTransitions(newHidden);
                          }}
                        />
                      ),
                    },
                  ]}
                  pagination={false}
                  bordered
                />
              </div>
            )}

            <figure>
              <div ref={containerRef} className="map-container" />
            </figure>
          </div>

          {/* Map Controls */}
          <div className="map-controls">
            <Space direction="vertical">
              {!isReadonly && onAddTransition && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={onAddTransition}
                  title="Add transition"
                  style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
                />
              )}
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
            <Space size="large">
              <div><span className="legend-circle state" /> State</div>
              <div><span className="legend-line automated" /> Automated Transition</div>
              <div><span className="legend-line manual" /> Manual Transition</div>
              <div><span className="legend-line criteria" /> Transition with Criteria</div>
              <div><span className="legend-line process" /> Process</div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalStateMachine;

