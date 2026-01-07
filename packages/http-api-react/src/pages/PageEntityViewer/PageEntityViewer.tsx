/**
 * PageEntityViewer
 * Main page for Entity Viewer functionality
 * 
 * Migrated from: .old_project/packages/http-api/src/views/PageEntityViewer.vue
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Select, Checkbox, Alert, Spin, Tooltip, Tabs } from 'antd';
import { InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined, SyncOutlined } from '@ant-design/icons';
import MonacoEditor, { BeforeMount } from '@monaco-editor/react';
import { registerCyodaThemes } from '@cyoda/ui-lib-react';

import { EntityViewer, type EntityViewerRef } from '../../components/EntityViewer';
import { ConfigEditorStreamGrid, type ConfigEditorStreamGridRef } from '@cyoda/ui-lib-react';
import { useEntityViewerStore } from '../../stores/entityViewerStore';
import { useGlobalUiSettingsStore } from '../../stores/globalUiSettingsStore';
import { getReportingFetchTypes, getStreamData } from '../../api/entities';
import { HelperEntities, eventBus } from '../../utils';
import type { EntityOption } from '../../utils/HelperEntities';
import './PageEntityViewer.scss';

const { Option } = Select;

export const PageEntityViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestClass, setRequestClass] = useState<string>('');
  const [requestClassOptionsDynamic, setRequestClassOptionsDynamic] = useState<EntityOption[]>([]);
  const [requestClassOptionsNonDynamic, setRequestClassOptionsNonDynamic] = useState<EntityOption[]>([]);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [entityDataMap, setEntityDataMap] = useState<Map<string, { reportingInfoRows: any[], relatedPaths: any[] }>>(new Map());
  const [isStreamGridAvailable, setIsStreamGridAvailable] = useState(false);
  const [streamGridTitle, setStreamGridTitle] = useState('Report Stream Result');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  );

  const entityViewerRefs = useRef<Map<string, EntityViewerRef>>(new Map());
  const streamGridRef = useRef<ConfigEditorStreamGridRef>(null);

  const { entitys, onlyDynamic, addEntity, clearEntities, setOnlyDynamic } = useEntityViewerStore();
  const { entityType } = useGlobalUiSettingsStore();

  const requestClassOptions = onlyDynamic ? requestClassOptionsDynamic : requestClassOptionsNonDynamic;


  // Generate JSON data for all entities with full reporting info
  const entitiesJson = useMemo(() => {
    if (entitys.length === 0) return '{}';
    
    const entitiesData = entitys.map(entity => {
      const entityData = entityDataMap.get(entity.to);
      return {
        entityClass: entity.to,
        entity: entity,
        reportingInfoRows: entityData?.reportingInfoRows || [],
        relatedPaths: entityData?.relatedPaths || [],
      };
    });
    
    return JSON.stringify(entitiesData, null, 2);
  }, [entitys, entityDataMap]);

  // Calculate dynamic height for Monaco Editor
  const jsonHeight = useMemo(() => {
    const lineCount = entitiesJson.split('\n').length;
    return Math.min(Math.max(lineCount * 22 + 40, 300), 500);
  }, [entitiesJson]);

  // Monaco Editor theme setup
  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Get current theme from document
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    // Register Cyoda themes (both light and dark)
    registerCyodaThemes(monaco, currentTheme);
  };


  // Load entity class options
  useEffect(() => {
    loadDataClassOptions();
  }, [onlyDynamic, entityType]);

  // Clear selection when entity type changes
  useEffect(() => {
    setRequestClass('');
    clearEntities();
  }, [entityType]);

  // Watch requestClass changes
  useEffect(() => {
    if (requestClass) {
      clearEntities();
      addEntity({ from: '', to: requestClass });
    }
  }, [requestClass]);

  // Event bus listeners
  useEffect(() => {
    const handleEntityInfoUpdate = () => {
      handleEntityViewerLoaded();
    };

    const handleStreamGridOpen = ({ configDefinitionRequest, title }: any) => {
      setIsStreamGridAvailable(true);
      setStreamGridTitle(title);

      setTimeout(() => {
        if (streamGridRef.current) {
          streamGridRef.current.setDialogVisible(true);
          streamGridRef.current.setConfigDefinitionRequest(configDefinitionRequest);
          streamGridRef.current.setOnlyUniq(true);
          // Pass the request directly to loadPage to avoid race condition
          streamGridRef.current.loadPage(false, configDefinitionRequest);
        }
      }, 100);
    };

    eventBus.on('entityInfo:update', handleEntityInfoUpdate);
    eventBus.on('streamGrid:open', handleStreamGridOpen);

    return () => {
      eventBus.off('entityInfo:update', handleEntityInfoUpdate);
      eventBus.off('streamGrid:open', handleStreamGridOpen);
    };
  }, []);

  // Watch for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setCurrentTheme(newTheme);
    };

    // Listen for theme changes on document element
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  // Draw lines when entities change
  useEffect(() => {
    if (entitys.length > 0) {
      // Wait for all entity viewers to render and position themselves
      setTimeout(() => {
        reDrawLines();
      }, 300);
    }
  }, [entitys.length]);

  const loadDataClassOptions = async () => {
    setIsLoading(true);
    try {
      const { data } = await getReportingFetchTypes(onlyDynamic);

      // Handle case when data is not an array (API error or demo mode)
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data, using empty list');
        if (onlyDynamic) {
          setRequestClassOptionsDynamic([]);
        } else {
          setRequestClassOptionsNonDynamic([]);
        }
        return;
      }

      const list = HelperEntities.getOptionsFromData(data, entityType);

      if (onlyDynamic) {
        setRequestClassOptionsDynamic(list);
      } else {
        // Filter out dynamic entities from non-dynamic list
        if (requestClassOptionsDynamic.length > 0) {
          const filtered = list.filter((el) => {
            return !requestClassOptionsDynamic.find((elDynamic) => elDynamic.value === el.value);
          });
          setRequestClassOptionsNonDynamic(filtered);
        } else {
          setRequestClassOptionsNonDynamic(list);
        }
      }
    } catch (error) {
      console.error('Failed to load entity classes:', error);
      // Set empty list on error
      if (onlyDynamic) {
        setRequestClassOptionsDynamic([]);
      } else {
        setRequestClassOptionsNonDynamic([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadStreamData = async (request: any) => {
    try {
      const { data } = await getStreamData(request);
      return data;
    } catch (error) {
      console.error('Failed to load stream data:', error);
      return { rows: [] };
    }
  };

const handleEntityViewerLoaded = useCallback((entityClass?: string, reportingInfoRows?: any[], relatedPaths?: any[]) => {
  // Turn off loading spinner when entity is loaded
  setIsLoading(false);

  // Store entity data if provided
  if (entityClass && reportingInfoRows && relatedPaths) {
    setEntityDataMap(prev => {
      const newMap = new Map(prev);
      newMap.set(entityClass, { reportingInfoRows, relatedPaths });
      return newMap;
    });
  }

  // Adjust container height based on entity viewers
  setTimeout(() => {
    const allEntities = document.querySelectorAll('.entity-viewer');
    const heights = Array.from(allEntities).map((el) => (el as HTMLElement).offsetHeight);
    const maxHeight = Math.max(...heights, 0);
    const boxInner = document.querySelector('.wrap-entity-view-box-inner') as HTMLElement;

    if (boxInner) {
      const currentHeight = boxInner.offsetHeight - 300;
      if (currentHeight < maxHeight) {
        boxInner.style.minHeight = `${maxHeight + 600}px`;
      }
    }

    // Draw lines after all entities are loaded and positioned
    reDrawLines();
  }, 100);
}, []);

  const handleResetRequestClass = () => {
    setRequestClass('');
  };

  const handleZoomIn = () => {
    if (zoom > 0.2) {
      setZoom(Math.floor((zoom - 0.1) * 10) / 10);
      reDrawLines();
    }
  };

  const handleZoomOut = () => {
    if (zoom < 2) {
      setZoom(Math.floor((zoom + 0.1) * 10) / 10);
      reDrawLines();
    }
  };

  const handleZoomRefresh = () => {
    setZoom(1);
    reDrawLines();
  };

  const reDrawLines = () => {
    // Trigger redraw on first entity viewer
    const firstRef = entityViewerRefs.current.values().next().value;
    if (firstRef) {
      firstRef.drawLines();
    }
  };

  const handleOnlyDynamicChange = (checked: boolean) => {
    setOnlyDynamic(checked);
    clearEntities();
    setRequestClass('');
  };

  return (
    <div className="page-entity-viewer">
      <h1 className="page-title">Entity Viewer</h1>
      <Spin spinning={isLoading}>
        <div className="entity-viewer-content">
          <div className="wrap-entity-select">
              <div className="select">
                <Select
                  value={requestClass || undefined}
                  onChange={setRequestClass}
                  placeholder="Select root entity class"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: 600 }}
                  options={requestClassOptions}
                  classNames={{ popup: { root: 'page-entity-viewer-dropdown' } }}
                  styles={{ popup: { root: { minWidth: '600px', maxWidth: '800px' } } }}
                />
              </div>

              <div className="checkbox">
                <Checkbox
                  checked={onlyDynamic}
                  onChange={(e) => handleOnlyDynamicChange(e.target.checked)}
                >
                  show only dynamic entities
                </Checkbox>
                <Tooltip
                  title={
                    <>
                      For dynamic entities you can do reports. <br />
                      With non-dynamic entities this is impossible
                    </>
                  }
                  placement="topLeft"
                >
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#a7a7a7', cursor: 'pointer' }} />
                </Tooltip>
              </div>
            </div>

            {!onlyDynamic && (
              <Alert
                message="Reports will not work for non-dynamic entities"
                type="warning"
                showIcon
                closable={false}
                style={{ marginBottom: 20 }}
              />
            )}
        {entitys.length > 0 && (
          <div className="view-mode-tabs">
            <Tabs
              activeKey={viewMode}
              onChange={(key) => setViewMode(key as 'table' | 'json')}
              type="card"
              className="entity-viewer-mode-tabs"
              items={[
                {
                  key: 'table',
                  label: 'Table',
                },
                {
                  key: 'json',
                  label: 'JSON',
                },
              ]}
            />
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
        <div className="wrap-entity-view-box">
        {entitys.length > 0 && (
        <div className="tools">
        <div className="buttons">
        <ZoomInOutlined onClick={handleZoomOut} />
        <ZoomOutOutlined onClick={handleZoomIn} />
        <SyncOutlined onClick={handleZoomRefresh} />
        {zoom !== 1 && (
        <>
        <span className="delimiter">|</span>
        <span>Zoom {zoom}</span>
        </>
        )}
        </div>
        </div>
        )}

        <div
        className="wrap-entity-view-box-inner"
        style={{ zoom }}
        >
        {entitys.map((entity) => (
        <EntityViewer
        key={entity.to}
        ref={(ref) => {
        if (ref) {
        entityViewerRefs.current.set(entity.to, ref);
        } else {
        entityViewerRefs.current.delete(entity.to);
        }
        }}
        requestClass={entity.to}
        entity={entity}
        zoom={zoom}
        className={entity.to.split('.').pop() || ''}
        dataInfo={JSON.stringify(entity)}
        dataName={entity.to.split('.').pop()}
        onLoaded={handleEntityViewerLoaded}
        onResetRequestClass={handleResetRequestClass}
        />
        ))}

        {entitys.length > 0 && (
        <svg className="canvas" width="100%" height="100%">
        {/* SVG lines will be drawn here */}
        </svg>
        )}
        </div>
        </div>
        )}


        {/* JSON View */}
        {viewMode === 'json' && entitys.length > 0 && (
        <div className="wrap-entity-json-view">
        <MonacoEditor
        height={`${jsonHeight}px`}
        language="json"
        theme={currentTheme === 'light' ? 'cyoda-light' : 'cyoda-dark'}
        value={entitiesJson}
        beforeMount={handleEditorWillMount}
        options={{
        readOnly: true,
        minimap: { 
          enabled: true,
          renderCharacters: true,
          maxColumn: 60,
          scale: 1,
          showSlider: 'always',
        },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        fontSize: 13,
        fontFamily: "'Fira Code', 'Monaco', monospace",
        stickyScroll: { enabled: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        }}
        />
        </div>
        )}


      {isStreamGridAvailable && (
        <ConfigEditorStreamGrid
          ref={streamGridRef}
          title={streamGridTitle}
          onLoadData={handleLoadStreamData}
        />
      )}
    </div>
  </Spin>
</div>
  );
};

