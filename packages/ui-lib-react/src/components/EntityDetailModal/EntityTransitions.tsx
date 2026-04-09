/**
 * EntityTransitions Component
 * Shows available transitions for an entity with a submit button.
 *
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true AND the entity is a Business entity
 * (entityClass in <modelName>.<modelVersion> format) AND entityData is provided:
 * - Uses PUT /entity/JSON/{entityId}/{transition} for named transitions
 * - Uses PUT /entity/JSON/{entityId} for loopback (save without transition)
 * - The request body is the entity JSON data
 *
 * Otherwise (standard mode, Technical entities, or no entityData):
 * - Uses PUT /platform-api/entity with the correct Java class name
 * - A transition is always required (no loopback option)
 * - When Cyoda Cloud is enabled and the entityClass is in Business format,
 *   the Java class com.cyoda.tdb.model.treenode.TreeNodeEntity is used
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, Button, Modal, notification } from 'antd';
import {
  axios,
  HelperFeatureFlags,
  isCyodaCloudEntityFormat,
  extractCyodaEntityData,
  updateCyodaCloudEntityWithTransition,
  updateCyodaCloudEntityLoopback,
} from '@cyoda/http-api-react';
import type { CyodaCloudUpdateOptions, CyodaCloudEntityEnvelope } from '@cyoda/http-api-react';
import './EntityTransitions.scss';

/**
 * The Java class name for TreeNodeEntity.
 * When VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true and the entityClass is in Business format
 * (<entityModelName>.<modelVersion>), the /platform-api/entity endpoint requires
 * the actual Java class name — never the modelName.modelVersion.
 */
const TREE_NODE_ENTITY_CLASS = 'com.cyoda.tdb.model.treenode.TreeNodeEntity';

/** Special transition value for saving without a state transition (loopback) */
const LOOPBACK_TRANSITION = 'loopback';

export interface EntityTransitionsProps {
  entityId: string;
  entityClass: string;
  /** Entity envelope or pure JSON data — for Cyoda Cloud loopback/transition via /entity endpoints.
   *  If an envelope ({ type, data, meta }), the pure entity data is extracted automatically. */
  entityData?: CyodaCloudEntityEnvelope | Record<string, unknown>;
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

  // Determine if the entityClass is in Business format (<modelName>.<modelVersion>)
  const isBusinessEntity = useMemo(
    () => isCyodaCloud && isCyodaCloudEntityFormat(entityClass),
    [entityClass, isCyodaCloud],
  );

  // Whether we can use the Cyoda Cloud /entity endpoints (requires Business entity + entityData)
  const useCloudApi = isBusinessEntity && !!entityData;

  // For the /platform-api/entity fallback: use TreeNodeEntity when the entityClass
  // is in Business format, otherwise use the entityClass as-is (already a Java class).
  const apiEntityClass = useMemo(() => {
    if (isBusinessEntity) {
      return TREE_NODE_ENTITY_CLASS;
    }
    return entityClass;
  }, [entityClass, isBusinessEntity]);

  // Cyoda Cloud update options
  const updateOptions: CyodaCloudUpdateOptions = useMemo(() => ({
    transactionTimeoutMillis,
    waitForConsistencyAfter,
  }), [transactionTimeoutMillis, waitForConsistencyAfter]);

  // Load available transitions
  // Only add the "loopback" option when the Cloud /entity endpoints can be used
  useEffect(() => {
    const loadTransitions = async () => {
      if (!entityId || !entityClass) return;

      try {
        const { data } = await axios.get<string[]>(
          `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`,
        );

        // Loopback is only supported by /entity/JSON/{entityId} (Cloud API)
        const availableTransitions = useCloudApi
          ? [LOOPBACK_TRANSITION, ...data]
          : data;

        setTransitions(availableTransitions);

        if (availableTransitions.length > 0) {
          form.setFieldsValue({ transition: availableTransitions[0] });
        }
      } catch (error) {
        console.error('Failed to load transitions:', error);
      }
    };

    loadTransitions();
  }, [entityId, entityClass, form, useCloudApi]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedTransition = values.transition;
      const isLoopback = selectedTransition === LOOPBACK_TRANSITION;

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
            if (useCloudApi) {
              // Cyoda Cloud API: /entity/JSON/{entityId}[/{transition}]
              // Extract pure entity JSON from the envelope for the PUT request body
              const pureEntityData = extractCyodaEntityData(entityData!) ?? entityData!;
              if (isLoopback) {
                await updateCyodaCloudEntityLoopback(entityId, pureEntityData, updateOptions);
              } else {
                await updateCyodaCloudEntityWithTransition(
                  entityId,
                  selectedTransition,
                  pureEntityData,
                  updateOptions,
                );
              }
            } else {
              // Standard API: PUT /platform-api/entity
              // Always requires a transition — loopback is never offered on this path.
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
              description: isLoopback
                ? 'Entity saved successfully'
                : 'Transition completed successfully',
            });

            // Reload transitions after successful operation
            const { data } = await axios.get<string[]>(
              `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`,
            );

            const availableTransitions = useCloudApi
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
              description: isLoopback
                ? 'Failed to save entity'
                : 'Failed to change transition',
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
