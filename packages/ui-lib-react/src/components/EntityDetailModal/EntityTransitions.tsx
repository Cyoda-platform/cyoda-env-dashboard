/**
 * EntityTransitions Component
 * Shows available transitions for an entity with a submit button
 *
 * Uses the transactional PUT /platform-api/entity endpoint for transitions.
 */

import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Modal, notification } from 'antd';
import { axios } from '@cyoda/http-api-react';
import './EntityTransitions.scss';

interface EntityTransitionsProps {
  entityId: string;
  entityClass: string;
  isEditable?: boolean;
  onTransitionChange?: () => void;
}

const EntityTransitions: React.FC<EntityTransitionsProps> = ({
  entityId,
  entityClass,
  isEditable = false,
  onTransitionChange,
}) => {
  const [form] = Form.useForm();
  const [transitions, setTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available transitions
  useEffect(() => {
    const loadTransitions = async () => {
      if (!entityId || !entityClass) return;

      const url = `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`;
      console.log('EntityTransitions - Loading transitions:', { entityId, entityClass, url });

      try {
        const response = await axios.get<string[]>(url);
        console.log('EntityTransitions - Response:', response.status, response.data);
        setTransitions(response.data || []);
        setError(null);

        // Set first transition as default
        if (response.data && response.data.length > 0) {
          form.setFieldsValue({ transition: response.data[0] });
        }
      } catch (err: any) {
        console.error('EntityTransitions - Failed to load transitions:', err);
        console.error('EntityTransitions - Error response:', err.response?.status, err.response?.data);
        setError(err.response?.data?.message || err.message || 'Failed to load');
        setTransitions([]);
      }
    };

    loadTransitions();
  }, [entityId, entityClass, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      Modal.confirm({
        title: 'Confirm Transition',
        content: 'Do you really want to attempt the new Transition?',
        okText: 'Confirm',
        onOk: async () => {
          setLoading(true);
          try {
            // Use transactional updateEntity endpoint
            await axios.put(`/platform-api/entity/${entityClass}/${entityId}`, {
              entityClass,
              entityId,
              transition: values.transition,
              transactional: true,
              async: false,
              values: [],
            });

            notification.success({
              message: 'Success',
              description: 'Transition completed successfully',
            });

            // Reload transitions after successful transition
            const { data } = await axios.get<string[]>(
              `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`
            );
            setTransitions(data || []);
            if (data && data.length > 0) {
              form.setFieldsValue({ transition: data[0] });
            }

            onTransitionChange?.();
          } catch (error) {
            console.error('Failed to change transition:', error);
            notification.error({
              message: 'Error',
              description: 'Failed to change transition',
            });
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <div className="entity-transitions">
      <h4>Transition Entity</h4>
      {error && (
        <p style={{ color: '#f5222d', fontSize: '12px' }}>Error: {error}</p>
      )}
      {transitions.length === 0 && !error ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No transitions available</p>
      ) : transitions.length > 0 ? (
        <Form form={form} layout="inline">
          <Form.Item
            label="Attempt"
            name="transition"
            rules={[{ required: !isEditable, message: 'Please select transition' }]}
          >
            <Select
              style={{ width: 220 }}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            >
              {transitions.map((transition) => (
                <Select.Option key={transition} value={transition}>
                  {transition}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      ) : null}
    </div>
  );
};

export default EntityTransitions;
