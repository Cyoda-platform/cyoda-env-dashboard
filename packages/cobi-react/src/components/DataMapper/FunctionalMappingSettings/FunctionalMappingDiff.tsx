import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Alert, Divider } from 'antd';
import beautify from 'js-beautify';
import './FunctionalMappingDiff.css';

export interface FunctionalMappingDiffRef {
  open: (oldObj: any, newObj: any) => void;
}

const FunctionalMappingDiff = forwardRef<FunctionalMappingDiffRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [oldString, setOldString] = useState('');
  const [newString, setNewString] = useState('');

  useImperativeHandle(ref, () => ({
    open: (oldObj: any, newObj: any) => {
      setOldString(beautifyJs(oldObj));
      setNewString(beautifyJs(newObj));
      setVisible(true);
    },
  }));

  const beautifyJs = (obj: any) => {
    return beautify.js(JSON.stringify(obj).trim(), {
      indent_size: 2,
      space_in_empty_paren: true,
      wrap_line_length: 50,
    });
  };

  return (
    <Modal
      title="Inconsistent Configuration"
      open={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      width="90%"
      okText="Confirm"
      cancelButtonProps={{ style: { display: 'none' } }}
      maskClosable={false}
    >
      <Alert
        message="Warning"
        description="Inconsistent configuration translation. If you continue, you need to check the configuration for completeness."
        type="warning"
        showIcon
        closable={false}
      />
      <Divider />
      <div className="functional-mapping-diff">
        <div className="code-diff-title">
          <div className="left">
            <h3>Generated</h3>
          </div>
          <div className="right">
            <h3>From Server</h3>
          </div>
        </div>
        <div className="code-diff-content">
          <div className="code-section">
            <pre>{newString}</pre>
          </div>
          <div className="code-section">
            <pre>{oldString}</pre>
          </div>
        </div>
      </div>
    </Modal>
  );
});

FunctionalMappingDiff.displayName = 'FunctionalMappingDiff';

export default FunctionalMappingDiff;

