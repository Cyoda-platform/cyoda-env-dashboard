import React from 'react';
import { Button, Drawer } from 'antd';
import { TransitionForm } from './nodes/TransitionForm';

export interface TransitionEditDrawerProps {
  open: boolean;
  stateName: string | null;
  transitionIndex: number | null;
  onClose: () => void;
}

export const TransitionEditDrawer: React.FC<TransitionEditDrawerProps> = ({ open, stateName, transitionIndex, onClose }) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      title="Edit transition"
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={onClose}>Done</Button>
        </div>
      }
    >
      {stateName !== null && transitionIndex !== null ? (
        <TransitionForm stateName={stateName} transitionIndex={transitionIndex} />
      ) : null}
    </Drawer>
  );
};
