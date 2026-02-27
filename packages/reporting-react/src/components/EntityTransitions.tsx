/**
 * EntityTransitions Component
 * Shows available transitions for an entity with a submit button
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailTransitions.vue
 *
 * In Cyoda Cloud mode (VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true):
 * - Uses PUT /entity/JSON/{entityId}/{transition} for transitions
 * - Uses PUT /entity/JSON/{entityId} for loopback (save without transition)
 * - Requires entityData prop with the entity JSON
 *
 * In standard mode:
 * - Uses PUT /platform-api/entity endpoint for transitions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, Button, Modal, notification } from 'antd';
import {
  axios,
  HelperFeatureFlags,
  updateCyodaCloudEntityWithTransition,
  updateCyodaCloudEntityLoopback,
  CyodaCloudUpdateOptions,
} from '@cyoda/http-api-react';
import './EntityTransitions.scss';

/**
 * The Java class name for TreeNodeEntity used in standard mode when Cyoda Cloud is enabled.
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true, the entityClassName from the backend
 * is in the format <entityModelName>.<modelVersion> (e.g., "Dataset.1"),
 * but the standard /platform-api/entity endpoint requires the actual Java class name.
 */
const CYODA_CLOUD_ENTITY_CLASS = 'com.cyoda.tdb.model.treenode.TreeNodeEntity';

/** Special transition value for saving without a state transition */
const LOOPBACK_TRANSITION = 'loopback';

interface EntityTransitionsProps {
  entityId: string;
  entityClass: string;
  /** Entity JSON data - required for Cyoda Cloud mode to save entity changes */
  entityData?: Record<string, unknown>;
  isEditable?: boolean;
  onTransitionChange?: () => void;
  /** Transaction timeout in milliseconds. Default: 10000 */
  transactionTimeoutMillis?: number;
  /** Wait for consistency after update. Default: true */
  waitForConsistencyAfter?: boolean;
}

const EntityTransitions: React.FC<EntityTransitionsProps> = ({
  entityId,
  entityClass,
  entityData,
  isEditable = false,
  onTransitionChange,
  transactionTimeoutMillis = 10000,
  waitForConsistencyAfter = true,
}) => {
  const [form] = Form.useForm();
  const [transitions, setTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isCyodaCloud = HelperFeatureFlags.isCyodaCloud();

  // In standard mode with Cyoda Cloud enabled, use the TreeNodeEntity class for entity UPDATE calls.
  // The entityClass prop may be in format "ModelName.Version" (e.g., "Dataset.1")
  // but the standard /platform-api/entity endpoint requires the actual Java class name.
  // Note: This is only used for the fallback standard API, not for Cyoda Cloud API.
  const apiEntityClass = useMemo(() => {
    if (isCyodaCloud) {
      return CYODA_CLOUD_ENTITY_CLASS;
    }
    return entityClass;
  }, [entityClass, isCyodaCloud]);

  // Cyoda Cloud update options
  const updateOptions: CyodaCloudUpdateOptions = useMemo(() => ({
    transactionTimeoutMillis,
    waitForConsistencyAfter,
  }), [transactionTimeoutMillis, waitForConsistencyAfter]);

  // Load available transitions (uses original entityClass, works with Cloud format)
  // Add "loopback" option for saving without transition in Cyoda Cloud mode
  useEffect(() => {
    const loadTransitions = async () => {
      if (!entityId || !entityClass) return;

      try {
        const { data } = await axios.get<string[]>(
          `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${entityClass}`
        );

        // In Cyoda Cloud mode, add "loopback" option for saving without transition
        const availableTransitions = isCyodaCloud && entityData
          ? [LOOPBACK_TRANSITION, ...data]
          : data;

        setTransitions(availableTransitions);

        // Set first transition as default
        if (availableTransitions.length > 0) {
          form.setFieldsValue({ transition: availableTransitions[0] });
        }
      } catch (error) {
        console.error('Failed to load transitions:', error);
      }
    };

    loadTransitions();
  }, [entityId, entityClass, form, isCyodaCloud, entityData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedTransition = values.transition;
      const isLoopback = selectedTransition === LOOPBACK_TRANSITION;

      // Determine confirmation dialog content based on action type
      const confirmTitle = isLoopback ? 'Confirm Save' : 'Confirm Transition';
      const confirmContent = isLoopback
        ? 'Do you really want to save the entity without a state transition?'
        : 'Do you really want to attempt the new Transition?';

      Modal.confirm({
        title: confirmTitle,
        content: confirmContent,
        okText: 'Confirm',
        onOk: async () => {
          setLoading(true);
          try {
            // Use Cyoda Cloud API if enabled AND entityData is provided
            if (isCyodaCloud && entityData) {
              if (isLoopback) {
                // Save without transition using PUT /entity/JSON/{entityId}
                await updateCyodaCloudEntityLoopback(entityId, entityData, updateOptions);
              } else {
                // Save with transition using PUT /entity/JSON/{entityId}/{transition}
                await updateCyodaCloudEntityWithTransition(
                  entityId,
                  selectedTransition,
                  entityData,
                  updateOptions
                );
              }
            } else {
              // Standard API: entityClass and entityId are only in the request body, not in the URL path.
              // In Cyoda Cloud mode without entityData, use TreeNodeEntity class name for the update.
              await axios.put('/platform-api/entity', {
                entityClass: apiEntityClass,
                entityId,
                transition: selectedTransition,
                transactional: true,
                async: false,
                values: [],
              });
            }

            notification.success({
              message: 'Success',
              description: isLoopback ? 'Entity saved successfully' : 'Transition completed successfully',
            });

            // Reload transitions after successful operation (uses original entityClass)
            const { data } = await axios.get<string[]>(
              `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`
            );

            // Re-add loopback option if in Cyoda Cloud mode with entityData
            const availableTransitions = isCyodaCloud && entityData
              ? [LOOPBACK_TRANSITION, ...data]
              : data;

            setTransitions(availableTransitions);
            if (availableTransitions.length > 0) {
              form.setFieldsValue({ transition: availableTransitions[0] });
            }

            onTransitionChange?.();
          } catch (error) {
            console.error('Failed to change transition:', error);
            notification.error({
              message: 'Error',
              description: isLoopback ? 'Failed to save entity' : 'Failed to change transition',
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
