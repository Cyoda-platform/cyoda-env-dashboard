import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export interface DialogCreateDataMappingRef {
  open: () => void;
}

const DialogCreateDataMapping = forwardRef<DialogCreateDataMappingRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
    },
  }));

  const handleCreate = () => {
    setVisible(false);
    // Navigate to data mapper create page
    navigate('/data-mapper/create');
  };

  return (
    <Modal
      title="Create Data Mapping"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setVisible(false)}>
          Cancel
        </Button>,
        <Button key="create" type="primary" onClick={handleCreate}>
          Create New Mapping
        </Button>,
      ]}
      width={600}
    >
      <p>This will open the Data Mapper editor to create a new data mapping configuration.</p>
      <p>You can define entity mappings, functional mappings, and configure data transformations.</p>
    </Modal>
  );
});

DialogCreateDataMapping.displayName = 'DialogCreateDataMapping';

export default DialogCreateDataMapping;

