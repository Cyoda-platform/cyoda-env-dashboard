import React from 'react';
import { Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getListAll } from '../../../api/chainingConfigApi';

interface ChainingsSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChainingsSelector: React.FC<ChainingsSelectorProps> = ({
  value = [],
  onChange,
  placeholder = 'Select chainings',
  disabled = false,
}) => {
  // Fetch all chaining configurations
  const { data: chainingConfigs, isLoading } = useQuery({
    queryKey: ['chainingConfigs'],
    queryFn: async () => {
      const response = await getListAll();
      return response.data;
    },
  });

  const options = (chainingConfigs || []).map((config: any) => ({
    label: config.name,
    value: config.id,
  }));

  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      options={options}
      notFoundContent={isLoading ? <Spin size="small" /> : 'No chainings available'}
      style={{ width: '100%' }}
      showSearch
      filterOption={(input, option) =>
        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default ChainingsSelector;

