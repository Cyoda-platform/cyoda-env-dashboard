/**
 * State Indicator Component
 * Visual indicator for boolean states (active, persisted, automated, etc.)
 * Migrated from: .old_project/packages/statemachine/src/components/States/StateComponent.vue
 */

import React from 'react';
import { Badge } from 'antd';
import './StateIndicator.css';

export interface StateIndicatorProps {
  state: boolean;
  type?: 'default' | 'automated';
  showText?: boolean;
}

export const StateIndicator: React.FC<StateIndicatorProps> = ({
  state,
  type = 'default',
  showText = false,
}) => {
  if (type === 'automated') {
    // Automated state indicator with "A" letter
    return (
      <div className="state-indicator-automated">
        <span
          className={`state-indicator-automated-badge ${state ? 'active' : 'inactive'}`}
        >
          A
        </span>
      </div>
    );
  }

  // Default state indicator with circular badge
  return (
    <div className="state-indicator">
      <Badge
        status={state ? 'success' : 'default'}
        text={showText ? (state ? 'Yes' : 'No') : undefined}
      />
    </div>
  );
};

export default StateIndicator;

