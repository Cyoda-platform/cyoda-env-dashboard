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
  const buttonStyle: React.CSSProperties = {
    borderColor: '#14b8a6 !important' as any,
    color: '#14b8a6 !important' as any,
  };

  const dangerButtonStyle: React.CSSProperties = {
    borderColor: '#ef4444 !important' as any,
    color: '#ef4444 !important' as any,
  };

  return (
    <div className={`graphical-state-machine-panel ${className}`}>
      <Space wrap>
        <Button onClick={onToggleListOfTransitions} style={buttonStyle}>
          {showListOfTransitions ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          List of transitions
        </Button>
        <Button onClick={onToggleProcesses} style={buttonStyle}>
          {showProcesses ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          processes
        </Button>
        <Button onClick={onToggleCriteria} style={buttonStyle}>
          {showCriteria ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          criteria
        </Button>
        <Button onClick={onToggleTitles} style={buttonStyle}>
          {showTitles ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          states
        </Button>
        <Button onClick={onToggleEdgesTitles} style={buttonStyle}>
          {showEdgesTitles ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          transitions titles
        </Button>
        <Button onClick={onResetPositions} type="default" danger style={dangerButtonStyle}>
          Reset positions
        </Button>
      </Space>
    </div>
  )
}

