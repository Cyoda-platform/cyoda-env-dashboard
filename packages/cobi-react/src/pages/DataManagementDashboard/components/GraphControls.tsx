import React from 'react';
import { Button, Space } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import './GraphControls.css';

interface GraphControlsProps {
  onFitGraph: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onPanTop: () => void;
  onPanBottom: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onFitGraph,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  onPanTop,
  onPanBottom,
}) => {
  return (
    <div className="graph-controls">
      <Space direction="vertical" size="small">
        <Button icon={<ExpandOutlined />} onClick={onFitGraph} title="Fit Graph" />
        <Button icon={<ZoomInOutlined />} onClick={onZoomIn} title="Zoom In" />
        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} title="Zoom Out" />
        <Button icon={<ArrowUpOutlined />} onClick={onPanTop} title="Pan Up" />
        <Button icon={<ArrowDownOutlined />} onClick={onPanBottom} title="Pan Down" />
        <Button icon={<ArrowLeftOutlined />} onClick={onPanLeft} title="Pan Left" />
        <Button icon={<ArrowRightOutlined />} onClick={onPanRight} title="Pan Right" />
      </Space>
    </div>
  );
};

export default GraphControls;

