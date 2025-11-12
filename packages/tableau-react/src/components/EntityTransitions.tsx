/**
 * EntityTransitions Component
 * Shows available transitions for an entity with a submit button
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailTransitions.vue
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

  // Load available transitions
  useEffect(() => {
    const loadTransitions = async () => {
      if (!entityId || !entityClass) return;

      try {
        const { data } = await axios.get<string[]>(
          `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${entityClass}`
        );
        setTransitions(data);

        // Set first transition as default
        if (data.length > 0) {
          form.setFieldsValue({ transition: data[0] });
        }
      } catch (error) {
        console.error('Failed to load transitions:', error);
      }
    };

    loadTransitions();
  }, [entityId, entityClass, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      Modal.confirm({
        title: 'Confirm',
        content: 'Do you really want to attempt the new Transition?',
        onOk: async () => {
          setLoading(true);
          try {
            await axios.put(
              `/platform-api/entity/transition?entityId=${encodeURIComponent(entityId)}&entityClass=${entityClass}&transitionName=${values.transition}`
            );

            notification.success({
              message: 'Success',
              description: 'Transition is changed',
            });

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
      {transitions.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No transitions available</p>
      ) : (
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
      )}
    </div>
  );
};

export default EntityTransitions;

