import React from 'react'
import { Switch } from 'antd'
import './EntityTypeSwitch.scss'

export type EntityType = 'BUSINESS' | 'PERSISTENCE'

export interface EntityTypeSwitchProps {
  /** Current entity type */
  value?: EntityType
  /** Callback when entity type changes */
  onChange?: (value: EntityType) => void
  /** Whether the switch is visible (based on user permissions) */
  visible?: boolean
  /** Whether the switch is disabled */
  disabled?: boolean
}

/**
 * EntityTypeSwitch Component
 * Toggle between Business and Technical entity types
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/EntityTypeSwitch/EntityTypeSwitch.vue
 */
export const EntityTypeSwitch: React.FC<EntityTypeSwitchProps> = ({
  value = 'BUSINESS',
  onChange,
  visible = true,
  disabled = false
}) => {
  if (!visible) return null

  const handleChange = (checked: boolean) => {
    const newValue: EntityType = checked ? 'PERSISTENCE' : 'BUSINESS'
    onChange?.(newValue)
  }

  return (
    <div className="entity-type-switch">
      <span>Entity Type: </span>
      <Switch
        checked={value === 'PERSISTENCE'}
        onChange={handleChange}
        checkedChildren="Technical"
        unCheckedChildren="Business"
        disabled={disabled}
      />
    </div>
  )
}

