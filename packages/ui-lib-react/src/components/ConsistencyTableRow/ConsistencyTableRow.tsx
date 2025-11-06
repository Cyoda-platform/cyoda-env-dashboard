import React from 'react'
import './ConsistencyTableRow.scss'

export interface ConsistencyRowData {
  processId?: string
  transition?: string
  transitionId?: string
  workflowId?: string
  unknownCriterias?: string[]
  unknownParams?: string[]
  unknownWorkflows?: string[]
  unknownStates?: string[]
  unknownProcessIds?: string[]
  unknownTransitions?: string[]
}

export interface ConsistencyTableRowProps {
  row: ConsistencyRowData
  className?: string
}

/**
 * ConsistencyTableRow Component
 * Displays a single row of state machine consistency check results
 */
export const ConsistencyTableRow: React.FC<ConsistencyTableRowProps> = ({
  row,
  className = ''
}) => {
  return (
    <div className={`consistency-table-row ${className}`}>
      <div className="title">
        {row.processId && (
          <>
            <strong>Process ID:</strong> {row.processId}
          </>
        )}
        {row.transitionId && (
          <>
            <strong>Transition ID:</strong> {row.transition}
          </>
        )}
        {row.workflowId && (
          <>
            <strong>WorkflowId:</strong> {row.workflowId}
          </>
        )}
      </div>

      <div className="body">
        {row.unknownCriterias && row.unknownCriterias.length > 0 && (
          <div>
            <strong>Unknown Criterias:</strong>
            <ol>
              {row.unknownCriterias.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}

        {row.unknownParams && row.unknownParams.length > 0 && (
          <div>
            <strong>Unknown Params:</strong>
            <ol>
              {row.unknownParams.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}

        {row.unknownWorkflows && row.unknownWorkflows.length > 0 && (
          <div>
            <strong>Unknown Workflows:</strong>
            <ol>
              {row.unknownWorkflows.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}

        {row.unknownStates && row.unknownStates.length > 0 && (
          <div>
            <strong>Unknown States:</strong>
            <ol>
              {row.unknownStates.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}

        {row.unknownProcessIds && row.unknownProcessIds.length > 0 && (
          <div>
            <strong>Unknown Process IDs:</strong>
            <ol>
              {row.unknownProcessIds.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}

        {row.unknownTransitions && row.unknownTransitions.length > 0 && (
          <div>
            <strong>Unknown Transitions:</strong>
            <ol>
              {row.unknownTransitions.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

