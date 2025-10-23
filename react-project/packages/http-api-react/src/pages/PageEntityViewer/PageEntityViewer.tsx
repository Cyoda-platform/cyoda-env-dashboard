/**
 * PageEntityViewer
 * Main page for Entity Viewer functionality
 * 
 * Migrated from: .old_project/packages/http-api/src/views/PageEntityViewer.vue
 */

import React, { useState, useEffect, useRef } from 'react';
import { Select, Checkbox, Alert, Spin, Tooltip } from 'antd';
import { InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined, SyncOutlined } from '@ant-design/icons';
import { CardComponent } from '@cyoda/ui-lib-react';
import { EntityViewer, type EntityViewerRef } from '../../components/EntityViewer';
import { StreamGrid, type StreamGridRef } from '../../components/StreamGrid';
import { useEntityViewerStore } from '../../stores/entityViewerStore';
import { useGlobalUiSettingsStore } from '../../stores/globalUiSettingsStore';
import { getReportingFetchTypes } from '../../api/entities';
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
  const [isStreamGridAvailable, setIsStreamGridAvailable] = useState(false);
  const [streamGridTitle, setStreamGridTitle] = useState('Report Stream Result');

  const entityViewerRefs = useRef<Map<string, EntityViewerRef>>(new Map());
  const streamGridRef = useRef<StreamGridRef>(null);

  const { entitys, onlyDynamic, addEntity, clearEntities, setOnlyDynamic } = useEntityViewerStore();
  const { entityType } = useGlobalUiSettingsStore();

  const requestClassOptions = onlyDynamic ? requestClassOptionsDynamic : requestClassOptionsNonDynamic;

  // Load entity class options
  useEffect(() => {
    loadDataClassOptions();
  }, [onlyDynamic, entityType]);

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
          streamGridRef.current.loadPage();
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

  const handleEntityViewerLoaded = () => {
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
    }, 100);
  };

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
      <Spin spinning={isLoading}>
        <CardComponent>
          <div className="card-body">
            <h2>
              Selected Root Entity{' '}
              {requestClass ? HelperEntities.getShortNameOfEntity(requestClass) : '-'}
            </h2>
            
            <div className="wrap-entity-select">
              <div className="select">
                <Select
                  value={requestClass || undefined}
                  onChange={setRequestClass}
                  placeholder="Entity Class"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: 400 }}
                  options={requestClassOptions}
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

            <div className="wrap-entity-view-box">
              <div className="tools">
                <div className="buttons">
                  <ZoomOutOutlined onClick={handleZoomOut} />
                  <ZoomInOutlined onClick={handleZoomIn} />
                  <SyncOutlined onClick={handleZoomRefresh} />
                  {zoom !== 1 && (
                    <>
                      <span className="delimiter">|</span>
                      <span>Zoom {zoom}</span>
                    </>
                  )}
                </div>
              </div>
              
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
          </div>
        </CardComponent>
      </Spin>

      {isStreamGridAvailable && (
        <StreamGrid ref={streamGridRef} title={streamGridTitle} />
      )}
    </div>
  );
};

