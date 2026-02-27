/**
 * ModellingPopUpSearch Component
 * Search input for modelling popup
 * Migrated from: CyodaModellingPopUpSearch.vue
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useModellingStore } from '../../stores/modellingStore';
import { debounce } from 'lodash';
import './ModellingPopUpSearch.scss';

interface ModellingPopUpSearchProps {
  onChange?: (value: { input: string }) => void;
}

export const ModellingPopUpSearch: React.FC<ModellingPopUpSearchProps> = ({ onChange }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<any>(null);
  const { clearSearch } = useModellingStore();

  // Debounced change handler
  const debouncedChange = useRef(
    debounce((value: string) => {
      if (value.length >= 2) {
        onChange?.({ input: value });
      } else {
        clearSearch();
        onChange?.({ input: '' });
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedChange(input);
  }, [input, debouncedChange]);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/' && inputRef.current) {
        event.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearSearch();
      debouncedChange.cancel();
    };
  }, [clearSearch, debouncedChange]);

  return (
    <Input
      ref={inputRef}
      className="modelling-popup-search"
      placeholder="Press / for search"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      suffix={<SearchOutlined />}
      allowClear
    />
  );
};

