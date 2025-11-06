import React, { useState, useRef, useMemo } from 'react';
import { Popover, Button, Tooltip } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import type { EntityMappingConfigDto } from '../../types';
import './MetaParamsRow.css';

interface MetaParam {
  name: string;
  displayName: string;
  type?: string;
}

interface MetaParamsRowProps {
  metaParam: MetaParam;
  allDataRelations: any[];
  selectedEntityMapping: EntityMappingConfigDto;
  onRelationsUpdate?: () => void;
}

const MetaParamsRow: React.FC<MetaParamsRowProps> = ({
  metaParam,
  allDataRelations,
  selectedEntityMapping,
  onRelationsUpdate,
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Get current relations for this meta param
  const currentRelations = useMemo(() => {
    return allDataRelations.filter(
      (el) => el.column?.srcColumnPath === metaParam.name
    );
  }, [allDataRelations, metaParam.name]);

  const isSelected = currentRelations.length > 0;

  const allRelationClasses = useMemo(() => {
    return currentRelations.map((el) => encodeURIComponent(el.column?.srcColumnPath || ''));
  }, [currentRelations]);

  // Check if meta param exists in script input meta paths
  const isExistInMeta = useMemo(() => {
    return selectedEntityMapping.script?.inputMetaPaths?.includes(metaParam.name) || false;
  }, [selectedEntityMapping.script, metaParam.name]);

  const handleStartDragLine = (event: React.MouseEvent) => {
    event.preventDefault();
    setPopoverVisible(false);

    const circleEl = rootRef.current?.querySelector('.circle') as HTMLElement;
    if (circleEl) {
      // Trigger drag start event
      // This would integrate with your drag-drop handler
      const dragEvent = new CustomEvent('startDragLine', {
        detail: {
          el: circleEl,
          path: metaParam.name,
          jsonPath: metaParam.name,
          type: 'cobiCoreMetadata',
        },
      });
      document.dispatchEvent(dragEvent);
    }
  };

  const handleDeleteRelation = () => {
    if (currentRelations.length > 0) {
      setPopoverVisible(false);
      
      // Trigger delete relation event
      const deleteEvent = new CustomEvent('removeRelation', {
        detail: currentRelations,
      });
      document.dispatchEvent(deleteEvent);

      if (onRelationsUpdate) {
        onRelationsUpdate();
      }
    }
  };

  const handleToggleMeta = () => {
    if (!selectedEntityMapping.script) {
      selectedEntityMapping.script = { inputMetaPaths: [] };
    }
    if (!selectedEntityMapping.script.inputMetaPaths) {
      selectedEntityMapping.script.inputMetaPaths = [];
    }

    const inputMetaPaths = selectedEntityMapping.script.inputMetaPaths;
    
    if (isExistInMeta) {
      // Remove from meta paths
      const index = inputMetaPaths.indexOf(metaParam.name);
      if (index > -1) {
        inputMetaPaths.splice(index, 1);
      }
    } else {
      // Add to meta paths
      inputMetaPaths.push(metaParam.name);
    }

    if (onRelationsUpdate) {
      onRelationsUpdate();
    }
  };

  const popoverContent = (
    <div>
      <div className="action">
        <Button type="link" onClick={handleStartDragLine}>
          Add new
        </Button>
      </div>
      {allRelationClasses.length > 0 && (
        <div className="action">
          <Button type="link" danger onClick={handleDeleteRelation}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className="meta-params-row"
      data-relation={allRelationClasses.join(' ')}
    >
      <div className="key">
        <CodeOutlined
          className={`settings ${isExistInMeta ? 'success' : 'error'}`}
          onClick={handleToggleMeta}
          title={isExistInMeta ? 'Remove from script meta paths' : 'Add to script meta paths'}
        />
        <Tooltip title={metaParam.name} mouseEnterDelay={1}>
          <span>{metaParam.displayName}</span>
        </Tooltip>

        <Popover
          content={popoverContent}
          title="Actions"
          placement="topLeft"
          trigger="click"
          open={popoverVisible}
          onOpenChange={setPopoverVisible}
          overlayClassName="popover-actions"
        >
          <div
            className={`circle ${isSelected || popoverVisible ? 'selected' : ''} cobi-core-metadata`}
          >
            {allRelationClasses.length > 1 && allRelationClasses.length}
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default MetaParamsRow;

