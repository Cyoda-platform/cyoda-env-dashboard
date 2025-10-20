/**
 * ReportResultDialog Component
 * Dialog for displaying quick report results
 */

import React from 'react';
import { Modal } from 'antd';
import ReportTableRows from './ReportTableRows';

interface ReportResultDialogProps {
  visible: boolean;
  reportData: any;
  onClose: () => void;
}

const ReportResultDialog: React.FC<ReportResultDialogProps> = ({
  visible,
  reportData,
  onClose,
}) => {
  if (!reportData) return null;

  return (
    <Modal
      title="Report Results"
      open={visible}
      onCancel={onClose}
      width="90%"
      footer={null}
      destroyOnClose
    >
      <ReportTableRows
        tableLinkRows={reportData.linkRows}
        configDefinition={reportData.configDefinition}
        lazyLoading={false}
      />
    </Modal>
  );
};

export default ReportResultDialog;

