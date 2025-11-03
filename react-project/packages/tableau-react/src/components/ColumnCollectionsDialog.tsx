/**
 * ColumnCollectionsDialog Component
 * Dialog for displaying column collection details
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterColumnCollections.vue
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Modal, Button } from 'antd';
import './ColumnCollectionsDialog.scss';

export interface ColumnData {
  headerName: string;
  data: {
    [key: string]: any;
  };
}

export interface ColumnCollectionsDialogRef {
  showDetail: (data: ColumnData) => void;
}

const ColumnCollectionsDialog = forwardRef<ColumnCollectionsDialogRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [columnData, setColumnData] = useState<ColumnData>({
    headerName: '',
    data: {},
  });

  const showDetail = (data: ColumnData) => {
    setVisible(true);
    setColumnData(data);
  };

  useImperativeHandle(ref, () => ({
    showDetail,
  }));

  const handleClose = () => {
    setVisible(false);
  };

  const title = `Column ${columnData.headerName}`;

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={600}
      className="column-collections-dialog"
    >
      <div className="column-collections-content">
        {Object.keys(columnData.data).map((key) => (
          <div key={key} className="sub-row">
            <div className="sub-row-title">{key}</div>
            <div className="sub-row-value">
              {typeof columnData.data[key] === 'object'
                ? JSON.stringify(columnData.data[key])
                : String(columnData.data[key])}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
});

ColumnCollectionsDialog.displayName = 'ColumnCollectionsDialog';

export default ColumnCollectionsDialog;

