import React, { useState, useEffect } from 'react'
import { Modal, Radio, Button, Space } from 'antd'
import type { RadioChangeEvent } from 'antd'
import './ExportVariants.scss'

export interface ExportFormat {
  description: string
  [key: string]: any
}

export interface ExportVariantsProps {
  visible: boolean
  onClose: () => void
  onExport: (format: ExportFormat) => void
  exportFormats?: ExportFormat[]
  className?: string
}

/**
 * ExportVariants Component
 * Modal dialog for selecting export format options
 */
export const ExportVariants: React.FC<ExportVariantsProps> = ({
  visible,
  onClose,
  onExport,
  exportFormats = [],
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)

  // Set default format when dialog opens or formats change
  useEffect(() => {
    if (visible && exportFormats.length > 0) {
      setSelectedFormat(exportFormats[0])
    }
  }, [visible, exportFormats])

  const handleChange = (e: RadioChangeEvent) => {
    setSelectedFormat(e.target.value)
  }

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat)
      onClose()
    }
  }

  return (
    <Modal
      className={`export-variants ${className}`}
      title="Export Options"
      open={visible}
      onCancel={onClose}
      width={500}
      maskClosable={false}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="export" type="primary" onClick={handleExport}>
          Export
        </Button>
      ]}
    >
      <Radio.Group value={selectedFormat} onChange={handleChange}>
        <Space direction="vertical">
          {exportFormats.map((format, index) => (
            <div key={index} className="wrap-option">
              <Radio value={format}>{format.description}</Radio>
            </div>
          ))}
        </Space>
      </Radio.Group>
    </Modal>
  )
}

