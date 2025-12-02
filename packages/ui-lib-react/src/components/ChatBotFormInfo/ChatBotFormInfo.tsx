import React from 'react'
import { Modal, Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import './ChatBotFormInfo.scss'

export interface ReturnDataType {
  name: string
  description: string
}

export interface ChatBotFormInfoProps {
  visible: boolean
  onClose: () => void
  returnDataTypes?: Record<string, string>
  className?: string
}

/**
 * ChatBotFormInfo Component
 * Modal dialog showing available return data types for AI ChatBot
 */
export const ChatBotFormInfo: React.FC<ChatBotFormInfoProps> = ({
  visible,
  onClose,
  returnDataTypes = {},
  className = ''
}) => {
  const tableData: ReturnDataType[] = Object.keys(returnDataTypes)
    .filter(key => key !== 'random')
    .map(key => ({
      name: key,
      description: returnDataTypes[key]
    }))

  const columns: ColumnsType<ReturnDataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: 'Prompt',
      dataIndex: 'description',
      key: 'description'
    }
  ]

  return (
    <Modal
      className={`ai-chat-bot-form-info ${className}`}
      title="Info"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <Table
        dataSource={tableData}
        bordered
          columns={columns}
        rowKey="name"
        pagination={false}
      />
    </Modal>
  )
}

