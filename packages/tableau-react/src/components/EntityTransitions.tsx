/**
 * EntityTransitions Component
 * Shows available transitions for an entity with a submit button
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailTransitions.vue
 *
 * Uses the transactional PUT /platform-api/entity endpoint for transitions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, Button, Modal, notification } from 'antd';
import { axios, HelperFeatureFlags } from '@cyoda/http-api-react';
import './EntityTransitions.scss';

/**
 * The Java class name for TreeNodeEntity used in Cyoda Cloud mode.
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true, the entityClassName from the backend
 * is in the format <entityModelName>.<modelVersion> (e.g., "Dataset.1"),
 * but the API endpoints require the actual Java class name.
 */
const CYODA_CLOUD_ENTITY_CLASS = 'com.cyoda.tdb.model.treenode.TreeNodeEntity';

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

  // In Cyoda Cloud mode, use the TreeNodeEntity class for entity UPDATE calls only.
  // The entityClass prop may be in format "ModelName.Version" (e.g., "Dataset.1")
  // but the entity update API requires the actual Java class name.
  // Note: fetch/transitions endpoint accepts the Cloud entity class format.
  const apiEntityClass = useMemo(() => {
    if (HelperFeatureFlags.isCyodaCloud()) {
      return CYODA_CLOUD_ENTITY_CLASS;
    }
    return entityClass;
  }, [entityClass]);

  // Load available transitions (uses original entityClass, works with Cloud format)
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
        title: 'Confirm Transition',
        content: 'Do you really want to attempt the new Transition?',
        okText: 'Confirm',
        onOk: async () => {
          setLoading(true);
          try {
            // entityClass and entityId are only in the request body, not in the URL path.
            // In Cyoda Cloud mode, use TreeNodeEntity class name for the update.
            await axios.put('/platform-api/entity', {
              entityClass: apiEntityClass,
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

            // Reload transitions after successful transition (uses original entityClass)
            const { data } = await axios.get<string[]>(
              `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`
            );
            setTransitions(data);
            if (data.length > 0) {
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
