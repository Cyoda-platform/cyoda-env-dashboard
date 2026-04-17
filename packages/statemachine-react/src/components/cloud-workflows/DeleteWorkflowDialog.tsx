/**
 * DeleteWorkflowDialog — disruptive delete confirmation per spec §5.4.
 *
 * The cloud delete is implemented as REPLACE-minus-target (export → filter →
 * REPLACE-import). Between the export and the import, another user could have
 * mutated the model. To make the race risk visible, this dialog:
 *
 *   - Lists every workflow that will remain after the delete (`keptNames`).
 *   - Shows the timestamp of the export the kept-list was built from.
 *   - Requires the user to type the exact `targetName` to enable the button.
 *   - Offers a Refresh button that re-runs the export upstream.
 *
 * The ≥1 invariant is enforced by the gateway BEFORE any POST, so the dialog
 * is never reached when only the target exists. This component is a UI safety
 * layer, not the invariant enforcement.
 */

import React, { useState, useEffect } from 'react';
import { Modal, List, Input, Typography, Space, Button } from 'antd';

const { Text, Paragraph } = Typography;

export interface DeleteWorkflowDialogProps {
  open: boolean;
  targetName: string;
  /** Workflows that will remain after delete. The dialog renders them by name. */
  keptNames: string[];
  /** Timestamp of the snapshot the kept-list was built from. */
  snapshotAt: Date;
  onConfirm: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const formatTime = (d: Date): string =>
  d.toISOString().substring(11, 19); // HH:MM:SS

export const DeleteWorkflowDialog: React.FC<DeleteWorkflowDialogProps> = ({
  open,
  targetName,
  keptNames,
  snapshotAt,
  onConfirm,
  onCancel,
  onRefresh,
}) => {
  const [typed, setTyped] = useState('');

  // Reset the typed-confirm field every time the dialog opens.
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const canConfirm = typed.trim() === targetName;

  return (
    <Modal
      title={`Delete workflow "${targetName}"`}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={`Delete ${targetName}`}
      okType="danger"
      okButtonProps={{ disabled: !canConfirm }}
      destroyOnHidden
      width={640}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Paragraph>
          This delete uses REPLACE on the entity model. Workflows kept after the delete:
        </Paragraph>
        <List
          size="small"
          bordered
          dataSource={keptNames}
          renderItem={(name) => <List.Item>{name}</List.Item>}
        />
        <Text type="secondary">
          Snapshot taken at {formatTime(snapshotAt)} — other users' changes after that
          time may be overwritten.{' '}
          <Button size="small" onClick={onRefresh}>
            Refresh snapshot
          </Button>
        </Text>
        <div>
          <label htmlFor="confirm-name">
            Type <Text strong>{targetName}</Text> to enable Delete:
          </label>
          <Input
            id="confirm-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="confirm name"
            autoFocus
          />
        </div>
      </Space>
    </Modal>
  );
};
