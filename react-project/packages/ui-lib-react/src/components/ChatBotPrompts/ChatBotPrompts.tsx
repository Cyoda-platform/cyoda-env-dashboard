import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Drawer, Table, Button, Modal, Input, message } from 'antd'
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import './ChatBotPrompts.scss'

const { TextArea } = Input

export interface Prompt {
  type: 'default' | 'user'
  value: string
  index?: number
}

export interface ChatBotPromptsProps {
  category?: string
  onLoadPrompts?: (category: string) => Promise<Prompt[]>
  onDeletePrompt?: (category: string, index: number) => Promise<void>
  onAddPrompt?: (category: string, prompt: string) => Promise<void>
  onSelected?: (value: string) => void
  className?: string
}

export interface ChatBotPromptsRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
  onClickAdd: () => void
}

/**
 * ChatBotPrompts Component
 * Displays a drawer with prompts table for AI chatbot
 */
export const ChatBotPrompts = forwardRef<ChatBotPromptsRef, ChatBotPromptsProps>(({
  category = '',
  onLoadPrompts,
  onDeletePrompt,
  onAddPrompt,
  onSelected,
  className = ''
}, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [tableData, setTableData] = useState<Prompt[]>([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [newPromptValue, setNewPromptValue] = useState('')
  const [modal, contextHolder] = Modal.useModal()

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible,
    onClickAdd: handleClickAdd
  }))

  useEffect(() => {
    if (dialogVisible) {
      loadData()
    }
  }, [dialogVisible, category])

  const loadData = async () => {
    if (onLoadPrompts && category) {
      const prompts = await onLoadPrompts(category)
      setTableData(prompts)
    }
  }

  const handleClickAdd = () => {
    setIsAddModalVisible(true)
    setNewPromptValue('')
  }

  const handleAddPrompt = async () => {
    if (!newPromptValue.trim()) {
      message.warning('Please enter a prompt')
      return
    }

    if (onAddPrompt && category) {
      await onAddPrompt(category, newPromptValue.trim())
      setIsAddModalVisible(false)
      setNewPromptValue('')
      await loadData()
      message.success('New prompt has been added')
    }
  }

  const handleDelete = async (row: Prompt) => {
    const confirmed = await modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to delete this prompt?',
    })

    if (confirmed && onDeletePrompt && category && row.index !== undefined) {
      await onDeletePrompt(category, row.index)
      await loadData()
      message.success('Selected prompt was removed')
    }
  }

  const handleSelect = (row: Prompt) => {
    onSelected?.(row.value)
    setDialogVisible(false)
  }

  const columns = [
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, row: Prompt) => (
        <div className="chat-bot-prompts__actions">
          {row.type === 'user' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(row)}
            />
          )}
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleSelect(row)}
          >
            Use
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {contextHolder}
      <Drawer
        className={`chat-bot-prompts ${className}`}
        open={dialogVisible}
        onClose={() => setDialogVisible(false)}
        width={700}
        title="Prompts"
        footer={
          <Button onClick={() => setDialogVisible(false)}>Close</Button>
        }
      >
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey={(record, index) => `${record.type}-${index}`}
          pagination={false}
        />
      </Drawer>

      <Modal
        title="Add new Prompt"
        open={isAddModalVisible}
        onOk={handleAddPrompt}
        onCancel={() => setIsAddModalVisible(false)}
        okText="OK"
        cancelText="Cancel"
      >
        <TextArea
          rows={4}
          value={newPromptValue}
          onChange={(e) => setNewPromptValue(e.target.value)}
          placeholder="Please add new Prompt"
        />
      </Modal>
    </>
  )
})

ChatBotPrompts.displayName = 'ChatBotPrompts'

