import React from 'react';
import { Tooltip } from 'antd';
import {
  COLOR_RELATION_COLUMN_MAPPING,
  COLOR_RELATION_FUNCTIONAL_MAPPING,
  COLOR_RELATION_CORE_METADATA,
  COLOR_RELATION_NOT_EXIST,
} from './MappingCanvas';
import './MappingLegend.css';

const MappingLegend: React.FC = () => {
  return (
    <div className="mapping-legend">
      <div className="mapping-legend-title">Mapping Types:</div>
      <div className="mapping-legend-items">
        <Tooltip title="Direct field-to-field mappings">
          <div className="mapping-legend-item">
            <div
              className="mapping-legend-line"
              style={{ backgroundColor: COLOR_RELATION_COLUMN_MAPPING }}
            />
            <span>Column</span>
          </div>
        </Tooltip>
        <Tooltip title="Mappings with transformations or functions">
          <div className="mapping-legend-item">
            <div
              className="mapping-legend-line"
              style={{ backgroundColor: COLOR_RELATION_FUNCTIONAL_MAPPING }}
            />
            <span>Functional</span>
          </div>
        </Tooltip>
        <Tooltip title="Core metadata mappings">
          <div className="mapping-legend-item">
            <div
              className="mapping-legend-line"
              style={{ backgroundColor: COLOR_RELATION_CORE_METADATA }}
            />
            <span>Metadata</span>
          </div>
        </Tooltip>
        <Tooltip title="Broken or non-existent relations">
          <div className="mapping-legend-item">
            <div
              className="mapping-legend-line dashed"
              style={{ backgroundColor: COLOR_RELATION_NOT_EXIST }}
            />
            <span>Broken</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default MappingLegend;

