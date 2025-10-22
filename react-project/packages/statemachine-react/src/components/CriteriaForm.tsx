/**
 * Criteria Form Component (Embedded)
 * Wrapper for Criteria page to be used in modals
 */

import React, { useEffect } from 'react';
import { Form, Input, Button, message, Space, Select } from 'antd';
import {
  useCriteria,
  useCriteriacheckers,
  useCreateCriteria,
  useUpdateCriteria,
} from '../hooks/useStatemachine';
import type { PersistedType, CriteriaForm as CriteriaFormType } from '../types';

const { TextArea } = Input;

interface CriteriaFormProps {
  criteriaId?: string;
  entityClassName: string;
  persistedType: PersistedType;
  mode?: 'embedded' | 'standalone';
  onSubmitted?: (params: { id?: string }) => void;
}

export const CriteriaForm: React.FC<CriteriaFormProps> = ({
  criteriaId = '',
  entityClassName,
  persistedType,
  mode = 'embedded',
  onSubmitted,
}) => {
  const [form] = Form.useForm();
  
  const isNew = !criteriaId || criteriaId === 'new';
  const isRuntime = persistedType === 'transient';
  
  // Queries
  const { data: criteria, isLoading: isLoadingCriteria } = useCriteria(
    persistedType,
    criteriaId || '',
    entityClassName,
    !isNew
  );
  const { data: criteriacheckers = [], isLoading: isLoadingCheckers } = useCriteriacheckers(entityClassName);
  
  // Mutations
  const createCriteriaMutation = useCreateCriteria();
  const updateCriteriaMutation = useUpdateCriteria();
  
  // Criteria checker options
  const checkerOptions = React.useMemo(() => {
    if (Array.isArray(criteriacheckers)) {
      return criteriacheckers.map((checker: any) => ({
        label: typeof checker === 'string' ? checker : (checker.name || checker.value || checker),
        value: typeof checker === 'string' ? checker : (checker.value || checker.name || checker),
      }));
    }
    return [];
  }, [criteriacheckers]);
  
  // Initialize form when criteria data loads
  useEffect(() => {
    if (criteria) {
      form.setFieldsValue({
        name: criteria.name,
        description: criteria.description || '',
        criteriaChecker: criteria.criteriaChecker || '',
      });
    }
  }, [criteria, form]);
  
  // Handlers
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: CriteriaFormType = {
        name: values.name,
        description: values.description,
        criteriaChecker: values.criteriaChecker,
        entityClassName,
      };
      
      let resultId;
      if (isNew) {
        const result = await createCriteriaMutation.mutateAsync({
          persistedType,
          form: formData,
        });
        resultId = result?.id || result?.Data?.id;
        message.success('Criteria created successfully');
      } else {
        await updateCriteriaMutation.mutateAsync({
          persistedType,
          criteriaId: criteriaId!,
          form: formData,
        });
        resultId = criteriaId;
        message.success('Criteria updated successfully');
      }
      
      if (onSubmitted) {
        onSubmitted({ id: resultId });
      }
    } catch (error) {
      message.error('Failed to save criteria');
    }
  };
  
  const isLoading = isLoadingCriteria || createCriteriaMutation.isPending || updateCriteriaMutation.isPending;
  
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: mode === 'embedded' ? '100%' : 600 }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter a name' }]}
      >
        <Input disabled={isRuntime} />
      </Form.Item>
      
      <Form.Item label="Description" name="description">
        <TextArea
          disabled={isRuntime}
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>
      
      <Form.Item
        label="Criteria Checker"
        name="criteriaChecker"
        rules={[{ required: true, message: 'Please select a criteria checker' }]}
      >
        <Select
          placeholder="Select criteria checker"
          disabled={isRuntime}
          loading={isLoadingCheckers}
          options={checkerOptions}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isRuntime}
          >
            {isNew ? 'Create' : 'Update'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CriteriaForm;

