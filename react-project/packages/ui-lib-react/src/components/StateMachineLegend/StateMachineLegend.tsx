import React from 'react'
import './StateMachineLegend.scss'

export interface StateMachineLegendProps {
  className?: string
}

/**
 * StateMachineLegend Component
 * Displays a legend explaining the visual elements of a state machine diagram
 */
export const StateMachineLegend: React.FC<StateMachineLegendProps> = ({
  className = ''
}) => {
  return (
    <div className={`legend ${className}`}>
      <figure>
        <div className="icon-state"></div>
        <figcaption>State</figcaption>
      </figure>
      <figure>
        <span className="icon-transition"></span>
        <figcaption>Automated Transition</figcaption>
      </figure>
      <figure>
        <span className="icon-transition-manual"></span>
        <figcaption>Manual Transition</figcaption>
      </figure>
      <figure>
        <span className="icon-transition"></span>
        <span className="icon-criteria"></span>
        <span className="icon-transition"></span>
        <figcaption>Transition with Criteria</figcaption>
      </figure>
      <figure>
        <span className="icon-process-edge"></span>
        <span className="icon-process"></span>
        <figcaption>Process</figcaption>
      </figure>
    </div>
  )
}

