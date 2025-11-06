import React from 'react';
import { Popover } from 'antd';
import type { EntityMappingConfigDto } from '../../types';
import './AssignMode.css';

type AssignModeType = 'single' | 'multiple';

interface AssignModeProps {
  value: AssignModeType;
  onChange: (mode: AssignModeType) => void;
  allDataRelations?: any[];
  isRoot?: boolean;
  path?: string;
  selectedEntityMapping?: EntityMappingConfigDto;
}

const AssignMode: React.FC<AssignModeProps> = ({
  value,
  onChange,
  allDataRelations = [],
  isRoot = false,
  path,
  selectedEntityMapping,
}) => {
  const handleChangeMode = (event: React.MouseEvent, newMode: AssignModeType) => {
    event.stopPropagation();
    event.preventDefault();

    // Determine path index based on mode
    const pathIndex = newMode === 'multiple' ? '*' : '0';

    // Get existing elements
    let existElements: any[] = [];
    if (isRoot) {
      existElements = allDataRelations;
    } else if (path) {
      existElements = allDataRelations.filter((el) => 
        el.column?.srcColumnPath?.indexOf(path) === 0
      );
    }

    // Get all selected paths
    const allSelectedPaths = existElements.map((el) => el.column?.srcColumnPath).filter(Boolean);

    // Get new paths with updated index
    const newSelectedPaths = getNewPathsForIndex(pathIndex, allSelectedPaths);

    // Update paths in entity mapping
    if (selectedEntityMapping) {
      updatePathsInEntityMapping(selectedEntityMapping, allSelectedPaths, newSelectedPaths);
    }

    // Notify parent of change
    onChange(newMode);
  };

  const getNewPathsForIndex = (pathIndex: string, allSelectedPaths: string[]): string[] => {
    const isPolymorphicList = selectedEntityMapping?.isPolymorphicList;
    let basePath = path || '';

    if (isPolymorphicList && path) {
      const paths = path.split('/');
      paths.pop();
      basePath = paths.join('/');
    }

    if (isRoot) {
      return allSelectedPaths.map((el) => {
        const temp = el.split('/');
        temp[0] = pathIndex;
        return temp.join('/');
      });
    }

    const newPartPath = `${basePath}/${pathIndex}/`;
    return allSelectedPaths.map((el) => {
      const escapedPath = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`${escapedPath}/(\\d+|\\*)?`);
      return el.replace(reg, newPartPath).replace(/\/\//g, '/').replace(/\/+$/g, '');
    });
  };

  const updatePathsInEntityMapping = (
    entityMapping: EntityMappingConfigDto,
    oldPaths: string[],
    newPaths: string[]
  ) => {
    const pathMap = new Map<string, string>();
    oldPaths.forEach((oldPath, index) => {
      pathMap.set(oldPath, newPaths[index]);
    });

    // Update column mappings
    entityMapping.columns.forEach((column) => {
      if (pathMap.has(column.srcColumnPath)) {
        column.srcColumnPath = pathMap.get(column.srcColumnPath)!;
      }
    });

    // Update functional mappings
    entityMapping.functionalMappings.forEach((fm) => {
      fm.srcPaths = fm.srcPaths.map((srcPath) => pathMap.get(srcPath) || srcPath);
    });

    // Update metadata
    if (entityMapping.cobiCoreMetadata) {
      entityMapping.cobiCoreMetadata.forEach((meta) => {
        if (meta.srcColumnPath && pathMap.has(meta.srcColumnPath)) {
          meta.srcColumnPath = pathMap.get(meta.srcColumnPath)!;
        }
      });
    }
  };

  const popoverContent = (
    <div>
      <strong>M</strong> - multiple <br />
      <strong>S</strong> - single
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title="Assign Mode"
      placement="topLeft"
      trigger="hover"
      mouseEnterDelay={1}
    >
      <div className="assign-mode">
        {value === 'single' ? (
          <div
            className="single-mode"
            onClick={(e) => handleChangeMode(e, 'multiple')}
            title="Click to switch to Multiple mode"
          >
            S
          </div>
        ) : (
          <div
            className="multiple-mode"
            onClick={(e) => handleChangeMode(e, 'single')}
            title="Click to switch to Single mode"
          >
            M
          </div>
        )}
      </div>
    </Popover>
  );
};

export default AssignMode;

