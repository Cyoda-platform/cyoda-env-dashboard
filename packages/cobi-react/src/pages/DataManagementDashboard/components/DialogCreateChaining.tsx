import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export interface DialogCreateChainingRef {
  open: () => void;
}

const DialogCreateChaining = forwardRef<DialogCreateChainingRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
    },
  }));

  const handleCreate = () => {
    setVisible(false);
    // Navigate to data chaining create page
    navigate('/data-chaining/create');
  };

  return (
    <Modal
      title="Create Data Chaining"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setVisible(false)}>
          Cancel
        </Button>,
        <Button key="create" type="primary" onClick={handleCreate}>
          Create New Chaining
        </Button>,
      ]}
      width={600}
    >
      <p>This will open the Data Chaining editor to create a new chaining configuration.</p>
      <p>You can define chaining rules, configure data source operations, and set up data pipelines.</p>
    </Modal>
  );
});

DialogCreateChaining.displayName = 'DialogCreateChaining';

export default DialogCreateChaining;

