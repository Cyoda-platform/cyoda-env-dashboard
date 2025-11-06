import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import './ModellingPopupSearch.scss'

export interface ModellingPopupSearchProps {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  minSearchLength?: number
  debounceDelay?: number
  className?: string
}

/**
 * ModellingPopupSearch Component
 * Search input with debounce and keyboard shortcut support
 */
export const ModellingPopupSearch: React.FC<ModellingPopupSearchProps> = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Press / for search',
  minSearchLength = 2,
  debounceDelay = 500,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<any>(null)

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounced change handler
  const debouncedChange = useCallback(
    debounce((val: string) => {
      if (val.length >= minSearchLength) {
        onChange?.(val)
      } else {
        onClear?.()
        onChange?.('')
      }
    }, debounceDelay),
    [onChange, onClear, minSearchLength, debounceDelay]
  )

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    debouncedChange(newValue)
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const searchListener = (event: KeyboardEvent) => {
      if (event.key === '/' && inputRef.current) {
        event.preventDefault()
        inputRef.current.focus()
      }
    }

    document.addEventListener('keyup', searchListener)

    return () => {
      document.removeEventListener('keyup', searchListener)
      debouncedChange.cancel()
    }
  }, [debouncedChange])

  return (
    <Input
      ref={inputRef}
      className={`modelling-popup-search ${className}`}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      suffix={<SearchOutlined />}
    />
  )
}

