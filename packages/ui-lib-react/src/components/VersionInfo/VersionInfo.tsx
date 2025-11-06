import React, { useState, useEffect } from 'react'
import { Modal, Button, Typography } from 'antd'
import './VersionInfo.scss'

const { Link } = Typography

export interface VersionData {
  version?: string
  buildTime?: string
  gitBranchName?: string
}

export interface VersionInfoProps {
  platform?: VersionData
  client?: VersionData
  uiVersion?: string
  uiBuildTime?: string
  uiBranchName?: string
  onLoadPlatform?: () => Promise<VersionData>
  onLoadClient?: () => Promise<VersionData>
  icon?: React.ReactNode
  linkText?: string
}

/**
 * VersionInfo Component
 * Displays version information for Platform, Client, and UI
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersion.vue
 */
export const VersionInfo: React.FC<VersionInfoProps> = ({
  platform: platformProp,
  client: clientProp,
  uiVersion = import.meta.env.VITE_APP_UI_VERSION || '-',
  uiBuildTime = import.meta.env.VITE_APP_UI_BUILD_TIME || '-',
  uiBranchName = import.meta.env.VITE_APP_UI_BRANCH_NAME || '-',
  onLoadPlatform,
  onLoadClient,
  icon,
  linkText = 'Version App'
}) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [platform, setPlatform] = useState<VersionData>(platformProp || {})
  const [client, setClient] = useState<VersionData>(clientProp || {})

  useEffect(() => {
    if (platformProp) {
      setPlatform(platformProp)
    }
  }, [platformProp])

  useEffect(() => {
    if (clientProp) {
      setClient(clientProp)
    }
  }, [clientProp])

  const handleClick = async () => {
    setDialogVisible(true)
    
    // Load data if callbacks provided
    if (onLoadPlatform && !platformProp) {
      const data = await onLoadPlatform()
      setPlatform(data)
    }
    
    if (onLoadClient && !clientProp) {
      const data = await onLoadClient()
      setClient(data)
    }
  }

  const renderInfoRow = (label: string, value?: string) => (
    <div className="detail-tree-item">
      <div className="title-value">
        <div className="name">{label}:</div>
        <div className="value">{value || '-'}</div>
      </div>
    </div>
  )

  return (
    <div className="cyoda-version">
      <Link onClick={handleClick}>
        {icon}
        {linkText}
      </Link>

      <Modal
        title=""
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        width="50%"
        maskClosable={false}
        footer={[
          <Button key="close" onClick={() => setDialogVisible(false)}>
            Close
          </Button>
        ]}
      >
        <h2>Platform</h2>
        {renderInfoRow('Version', platform.version)}
        {renderInfoRow('Build Time', platform.buildTime)}
        {renderInfoRow('Branch Name', platform.gitBranchName)}

        <hr />
        <h2>Client</h2>
        {renderInfoRow('Version', client.version)}
        {renderInfoRow('Build Time', client.buildTime)}
        {renderInfoRow('Branch Name', client.gitBranchName)}

        <hr />
        <h2>UI</h2>
        {renderInfoRow('Version', uiVersion)}
        {renderInfoRow('Build Time', uiBuildTime)}
        {renderInfoRow('Branch Name', uiBranchName)}
      </Modal>
    </div>
  )
}

