import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Modal, Button } from 'antd'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import beautify from 'js-beautify'
import './QueryPlanDetailRaw.scss'

export interface QueryPlanDetailRawRef {
  dialogVisible: boolean
  setDialogVisible: (visible: boolean) => void
}

export interface QueryPlanDetailRawProps {
  queryPlan?: any
  title?: string
  className?: string
}

/**
 * QueryPlanDetailRaw Component
 * Displays raw query plan in a modal with syntax highlighting
 */
export const QueryPlanDetailRaw = forwardRef<QueryPlanDetailRawRef, QueryPlanDetailRawProps>(({
  queryPlan = {},
  title = '',
  className = ''
}, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible
  }))

  const computedTitle = useMemo(() => {
    return `Query Plan Raw For ${title}`
  }, [title])

  const codeObj = useMemo(() => {
    const data = beautify.js(JSON.stringify(queryPlan).trim(), {
      indent_size: 2,
      space_in_empty_paren: true,
      wrap_line_length: 50
    })
    return {
      className: 'language-javascript',
      code: Prism.highlight(data, Prism.languages.javascript, 'javascript')
    }
  }, [queryPlan])

  return (
    <Modal
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      title={computedTitle}
      width="80%"
      className={`query-plan-detail-raw ${className}`}
      maskClosable={false}
      footer={[
        <Button key="close" onClick={() => setDialogVisible(false)}>
          Close
        </Button>
      ]}
    >
      <pre className={codeObj.className}>
        <code
          className={codeObj.className}
          dangerouslySetInnerHTML={{ __html: codeObj.code }}
        />
      </pre>
    </Modal>
  )
})

QueryPlanDetailRaw.displayName = 'QueryPlanDetailRaw'

