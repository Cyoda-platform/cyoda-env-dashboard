import React, { useRef, useEffect, useState } from 'react'
import Sortable from 'sortablejs'

export interface DataTableDraggableProps {
  handle?: string
  animate?: number
  onDrag?: () => void
  onDrop?: (params: { targetObject: any; list: any[] }) => void
  children: React.ReactElement
}

/**
 * DataTableDraggable Component
 * Wrapper component that makes a DataTable draggable using SortableJS
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTablesDraggable.vue
 */
export const DataTableDraggable: React.FC<DataTableDraggableProps> = ({
  handle,
  animate = 150,
  onDrag,
  onDrop,
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sortableInstanceRef = useRef<Sortable | null>(null)
  const [tableKey, setTableKey] = useState(0)

  const makeTableSortable = () => {
    if (!wrapperRef.current) return

    const table = wrapperRef.current.querySelector('.ant-table-tbody')
    if (!table) return

    // Destroy existing instance
    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy()
    }

    sortableInstanceRef.current = Sortable.create(table as HTMLElement, {
      handle: handle,
      animation: animate,
      onStart: () => {
        onDrag?.()
      },
      onEnd: ({ newIndex, oldIndex }) => {
        if (newIndex === undefined || oldIndex === undefined) return

        keepWrapperHeight(true)
        setTableKey(Math.random())

        // Get data from children props
        const childProps = (children as any)?.props
        const data = childProps?.dataSource || childProps?.data || []
        
        if (data && data.length > 0) {
          const arr = [...data]
          const targetRow = arr.splice(oldIndex, 1)[0]
          arr.splice(newIndex, 0, targetRow)

          onDrop?.({ targetObject: targetRow, list: arr })
        }
      }
    })
  }

  const keepWrapperHeight = (keep: boolean) => {
    if (!wrapperRef.current) return

    if (keep) {
      wrapperRef.current.style.minHeight = `${wrapperRef.current.clientHeight}px`
    } else {
      wrapperRef.current.style.minHeight = 'auto'
    }
  }

  useEffect(() => {
    // Wait for table to render
    const timer = setTimeout(() => {
      makeTableSortable()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy()
      }
    }
  }, [handle, animate])

  useEffect(() => {
    // Re-initialize sortable when table updates
    const timer = setTimeout(() => {
      makeTableSortable()
      keepWrapperHeight(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [tableKey, children])

  return (
    <div ref={wrapperRef}>
      <div key={tableKey}>
        {children}
      </div>
    </div>
  )
}

