import React from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import './JsonFileUpload.scss'

const { Dragger } = Upload

export interface JsonFileUploadProps {
  onChange?: (data: any) => void
  className?: string
}

/**
 * JsonFileUpload Component
 * File upload component that accepts and parses JSON files
 */
export const JsonFileUpload: React.FC<JsonFileUploadProps> = ({
  onChange,
  className = ''
}) => {
  const isJsonString = (str: string): boolean => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const rawData = reader.result as string
      
      if (!isJsonString(rawData)) {
        message.error('Was uploaded incorrect file')
        return
      }
      
      const dataFile = JSON.parse(rawData)
      onChange?.(dataFile)
    }
    
    reader.readAsText(file)
    
    // Prevent automatic upload
    return false
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'application/json,.json',
    beforeUpload: handleBeforeUpload,
    showUploadList: false,
    maxCount: 1
  }

  return (
    <div className={`json-file-upload ${className}`}>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single JSON file upload only.
        </p>
      </Dragger>
    </div>
  )
}

