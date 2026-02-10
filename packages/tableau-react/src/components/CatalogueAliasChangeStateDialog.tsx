/**
 * Catalogue Alias Change State Dialog Component
 * Migrated from: .old_project/packages/http-api/src/components/CatalogOfAliasesChangeState/CatalogOfAliasesChangeState.vue
 *
 * Dialog for changing the state of an alias catalog item
 * Uses the transactional PUT /platform-api/entity endpoint for transitions.
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEntityTransitions, executeEntityTransition } from '@cyoda/http-api-react';
import './CatalogueAliasChangeStateDialog.scss';

export interface CatalogueAliasChangeStateDialogProps {
  onStateChanged: () => void;
}

export interface CatalogueAliasChangeStateDialogRef {
  open: (id: string, entityClass: string) => void;
  close: () => void;
}

export const CatalogueAliasChangeStateDialog = forwardRef<
  CatalogueAliasChangeStateDialogRef,
  CatalogueAliasChangeStateDialogProps
>(({ onStateChanged }, ref) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [entityId, setEntityId] = useState<string>('');
  const [entityClass, setEntityClass] = useState<string>('');

  // Fetch available transitions
  const { data: transitions = [], isLoading } = useQuery({
    queryKey: ['entityTransitions', entityId, entityClass],
    queryFn: async () => {
      if (!entityId || !entityClass) return [];
      const { data } = await getEntityTransitions(entityClass, entityId);
      return data;
    },
    enabled: !!entityId && !!entityClass,
  });

  // Execute transition mutation
  const transitionMutation = useMutation({
    mutationFn: async (transition: string) => {
      await executeEntityTransition(entityClass, entityId, transition);
    },
    onSuccess: () => {
      message.success('State transition successful');
      setVisible(false);
      onStateChanged();
    },
    onError: () => {
      message.error('Failed to execute state transition');
    },
  });

  useImperativeHandle(ref, () => ({
    open: (id: string, entClass: string) => {
      setEntityId(id);
      setEntityClass(entClass);
      setVisible(true);
      form.resetFields();
    },
    close: () => setVisible(false),
  }));

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      if (!values.transition) {
        message.warning('Please select a state');
        return;
      }
      transitionMutation.mutate(values.transition);
    } catch (error) {
      // Validation failed
    }
  };

  return (
    <Modal
      title="Attempt Transition"
      open={visible}
      onCancel={() => setVisible(false)}
      className="catalogue-alias-change-state-dialog"
      onOk={handleConfirm}
      okText="Confirm"
      confirmLoading={transitionMutation.isPending}
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="State"
          name="transition"
          rules={[{ required: true, message: 'Please select a state' }]}
        >
          <Select
            placeholder="Select"
            loading={isLoading}
            options={transitions.map((t) => ({
              value: t,
              label: t,
            }))}
            classNames={{ popup: { root: 'catalogue-alias-state-dropdown' } }}
            styles={{ popup: { root: { minWidth: '300px' } } }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

CatalogueAliasChangeStateDialog.displayName = 'CatalogueAliasChangeStateDialog';

export default CatalogueAliasChangeStateDialog;

