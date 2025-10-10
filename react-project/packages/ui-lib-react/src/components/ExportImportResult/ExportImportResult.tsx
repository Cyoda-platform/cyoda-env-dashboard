import React, { useEffect, useState } from 'react'
import { Tag, Button, Popover, Modal } from 'antd'
import { InfoCircleOutlined, SyncOutlined } from '@ant-design/icons'
import './ExportImportResult.scss'

export interface ExportImportInstance {
  name?: string | string[]
  isSuccess?: boolean
  errorDesc?: string
  isSolveLoading?: boolean
  doImport?: () => void | Promise<void>
  doSolveProblem?: () => void | Promise<void>
}

export interface ExportImportResultProps {
  instance?: ExportImportInstance
  onMount?: () => void
  className?: string
}

/**
 * ExportImportResult Component
 * Displays the result of an export/import operation
 */
export const ExportImportResult: React.FC<ExportImportResultProps> = ({
  instance = {},
  onMount,
  className = ''
}) => {
  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    if (instance.doImport) {
      instance.doImport()
    }
    onMount?.()
  }, [instance, onMount])

  const handleSolveProblem = async () => {
    const confirmed = await modal.confirm({
      title: 'Confirm!',
      content: 'You have same item in system. If you press "OK" system will replace exist item by new. Continue?',
    })

    if (confirmed) {
      instance.doSolveProblem?.()
    }
  }

  const renderName = () => {
    if (typeof instance.name === 'string') {
      return <div>{instance.name}</div>
    } else if (Array.isArray(instance.name)) {
      return (
        <div>
          {instance.name.map((name, index) => (
            <div key={index} className="export-import-result__names-list">
              {index + 1}) {name}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`export-import-result ${className}`}>
      {contextHolder}
      {renderName()}
      <div className="export-import-result__result-box">
        {instance.isSuccess === true && (
          <Tag color="success">Success</Tag>
        )}
        {instance.isSuccess === false && (
          <>
            <Tag color="error">Fail</Tag>
            {instance.errorDesc && (
              <Popover
                content={instance.errorDesc}
                title="Error"
                trigger="click"
                placement="topLeft"
              >
                <Button shape="circle" icon={<InfoCircleOutlined />} />
              </Popover>
            )}
            {instance.doSolveProblem && (
              <Button
                type="primary"
                shape="circle"
                disabled={instance.isSolveLoading}
                onClick={handleSolveProblem}
                icon={<SyncOutlined spin={instance.isSolveLoading} />}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

