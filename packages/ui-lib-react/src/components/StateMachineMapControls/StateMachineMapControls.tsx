import React from 'react'
import { Button } from 'antd'
import {
  ExpandOutlined,
  PlusOutlined,
  MinusOutlined,
  LeftOutlined,
  UpOutlined,
  RightOutlined,
  DownOutlined
} from '@ant-design/icons'
import './StateMachineMapControls.scss'

export interface StateMachineMapControlsProps {
  isFullscreen?: boolean
  isAvailableAddButton?: boolean
  onFitGraph?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onPanLeft?: () => void
  onPanTop?: () => void
  onPanRight?: () => void
  onPanBottom?: () => void
  onToggleFullscreen?: () => void
  onCreateTransition?: () => void
  className?: string
}

/**
 * StateMachineMapControls Component
 * Control panel for state machine map with zoom, pan, and fit controls
 */
export const StateMachineMapControls: React.FC<StateMachineMapControlsProps> = ({
  isFullscreen = false,
  isAvailableAddButton = true,
  onFitGraph,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanTop,
  onPanRight,
  onPanBottom,
  onToggleFullscreen,
  onCreateTransition,
  className = ''
}) => {
  return (
    <div className={`state-machine-map-controls ${className}`}>
      <Button
        className="state-machine-map-controls__fit-graph"
        onClick={onFitGraph}
        shape="circle"
        title="Fit graph"
        icon={<ExpandOutlined />}
      />
      <br />
      <Button
        className="state-machine-map-controls__zoom-in"
        onClick={onZoomIn}
        shape="circle"
        title="Zoom in"
        icon={<PlusOutlined />}
      />
      <Button
        className="state-machine-map-controls__zoom-out"
        onClick={onZoomOut}
        shape="circle"
        title="Zoom out"
        icon={<MinusOutlined />}
      />
      <Button
        className="state-machine-map-controls__move-left"
        onClick={onPanLeft}
        shape="circle"
        title="Move left"
        icon={<LeftOutlined />}
      />
      <Button
        className="state-machine-map-controls__move-up"
        onClick={onPanTop}
        shape="circle"
        title="Move up"
        icon={<UpOutlined />}
      />
      <Button
        className="state-machine-map-controls__move-right"
        onClick={onPanRight}
        shape="circle"
        title="Move right"
        icon={<RightOutlined />}
      />
      <Button
        className="state-machine-map-controls__move-down"
        onClick={onPanBottom}
        shape="circle"
        title="Move down"
        icon={<DownOutlined />}
      />
      {isAvailableAddButton && (
        <Button
          className="state-machine-map-controls__create-transition"
          onClick={onCreateTransition}
          type="primary"
          title="Create transition"
        >
          Add
        </Button>
      )}
    </div>
  )
}

