import React, { useState, useEffect } from 'react'
import { Alert } from 'antd'
import './VersionMismatch.scss'

export interface VersionMismatchProps {
  platformVersion?: string
  uiVersion?: string
  onCheckVersion?: () => Promise<{ version?: string }>
}

/**
 * VersionMismatch Component
 * Displays a warning when platform and UI versions don't match
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersionMismatch.vue
 */
export const VersionMismatch: React.FC<VersionMismatchProps> = ({
  platformVersion: platformVersionProp,
  uiVersion: uiVersionProp = import.meta.env.VITE_APP_UI_VERSION || '-',
  onCheckVersion
}) => {
  const [isVersionEqual, setIsVersionEqual] = useState(true)
  const [platformVersion, setPlatformVersion] = useState(platformVersionProp || '-')

  useEffect(() => {
    const checkVersion = async () => {
      let platformVersion = platformVersionProp

      // Load platform version if callback provided
      if (onCheckVersion && !platformVersionProp) {
        const data = await onCheckVersion()
        platformVersion = data.version || '-'
        setPlatformVersion(platformVersion)
      }

      // Extract semantic version (x.y.z) from both versions
      const platformVersionMatch = platformVersion?.match(/\d+\.\d+\.\d+/)
      const uiVersionMatch = uiVersionProp?.match(/\d+\.\d+\.\d+/)

      if (platformVersionMatch && uiVersionMatch) {
        setIsVersionEqual(platformVersionMatch[0] === uiVersionMatch[0])
      } else {
        // If we can't extract versions, assume they don't match
        setIsVersionEqual(false)
      }
    }

    checkVersion()
  }, [platformVersionProp, uiVersionProp, onCheckVersion])

  if (isVersionEqual) {
    return null
  }

  return (
    <div className="cyoda-version-mismatch">
      <Alert
        message="Version Mismatch"
        description={`Platform version: ${platformVersion}, but UI version is ${uiVersionProp}. This may cause the system to malfunction.`}
        type="warning"
        showIcon
        closable={false}
      />
    </div>
  )
}

