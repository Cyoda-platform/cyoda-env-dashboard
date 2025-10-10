import React from 'react'
import { Button, Space } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import './GraphicalStateMachinePanel.scss'

export interface GraphicalStateMachinePanelProps {
  showProcesses?: boolean
  showListOfTransitions?: boolean
  showCriteria?: boolean
  showTitles?: boolean
  showEdgesTitles?: boolean
  onToggleListOfTransitions?: () => void
  onToggleProcesses?: () => void
  onToggleCriteria?: () => void
  onToggleTitles?: () => void
  onToggleEdgesTitles?: () => void
  onResetPositions?: () => void
  className?: string
}

/**
 * GraphicalStateMachinePanel Component
 * Control panel for toggling visibility of state machine elements
 */
export const GraphicalStateMachinePanel: React.FC<GraphicalStateMachinePanelProps> = ({
  showProcesses = true,
  showListOfTransitions = true,
  showCriteria = true,
  showTitles = true,
  showEdgesTitles = false,
  onToggleListOfTransitions,
  onToggleProcesses,
  onToggleCriteria,
  onToggleTitles,
  onToggleEdgesTitles,
  onResetPositions,
  className = ''
}) => {
  return (
    <div className={`graphical-state-machine-panel ${className}`}>
      <Space wrap>
        <Button onClick={onToggleListOfTransitions}>
          {showListOfTransitions ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          List of transitions
        </Button>
        <Button onClick={onToggleProcesses}>
          {showProcesses ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          processes
        </Button>
        <Button onClick={onToggleCriteria}>
          {showCriteria ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          criteria
        </Button>
        <Button onClick={onToggleTitles}>
          {showTitles ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          states
        </Button>
        <Button onClick={onToggleEdgesTitles}>
          {showEdgesTitles ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          transitions titles
        </Button>
        <Button onClick={onResetPositions} type="default" danger>
          Reset positions
        </Button>
      </Space>
    </div>
  )
}

