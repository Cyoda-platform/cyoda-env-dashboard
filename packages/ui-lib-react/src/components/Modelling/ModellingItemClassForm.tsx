/**
 * ModellingItemClassForm Component
 * Form for entering indices/keys for LIST and MAP types
 * Migrated from: CyodaModellingItemClassForm.vue
 */

import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import './ModellingItemClassForm.scss';

interface ModellingItemClassFormProps {
  types: string[];
  values?: string[];
  isAvailableSubmit?: boolean;
  onChange: (values: string[]) => void;
}

export const ModellingItemClassForm: React.FC<ModellingItemClassFormProps> = ({
  types,
  values = [],
  isAvailableSubmit = true,
  onChange,
}) => {
  const [form, setForm] = useState<string[]>([]);

  // Initialize form from values
  useEffect(() => {
    if (values.length > 0) {
      const newForm = types.map((_, index) => values[index] || '');
      setForm(newForm);
    } else {
      setForm(types.map(() => ''));
    }
  }, [values, types]);

  const handleInputChange = (index: number, value: string) => {
    const newForm = [...form];
    newForm[index] = value;
    setForm(newForm);

    // If auto-submit is enabled, emit change immediately
    if (!isAvailableSubmit) {
      onChange(newForm);
    }
  };

  const handleSubmit = () => {
    const formData = form.map((value) => (value === '' ? '*' : value));
    onChange(formData);
  };

  const getPlaceholder = (type: string) => {
    if (type === 'Integer') {
      return 'Integer';
    } else if (type === 'String') {
      return 'String';
    }
    return type;
  };

  const getInputProps = (type: string) => {
    if (type === 'Integer') {
      return {
        type: 'text',
        pattern: '[0-9*]+',
      };
    }
    return {
      type: 'text',
    };
  };

  return (
    <div className="modelling-item-class-form">
      <div className="flex">
        {types.map((type, index) => (
          <div key={index} className="inner-field-type">
            <Input
              size="small"
              placeholder={getPlaceholder(type)}
              value={form[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              {...getInputProps(type)}
            />
          </div>
        ))}
        {isAvailableSubmit && (
          <div className="wrap-btn">
            <Button size="small" type="primary" onClick={handleSubmit}>
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

