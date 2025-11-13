/**
 * ReportResultDialog Component
 * Dialog for displaying quick report results
 */

import React from 'react';
import { Modal } from 'antd';
import ReportTableRows from './ReportTableRows';
import type { ColumnData } from './ColumnCollectionsDialog';
import './ReportResultDialog.scss';

interface ReportResultDialogProps {
  visible: boolean;
  reportData: any;
  onClose: () => void;
  onShowColumnDetail?: (data: ColumnData) => void;
}

const ReportResultDialog: React.FC<ReportResultDialogProps> = ({
  visible,
  reportData,
  onClose,
  onShowColumnDetail,
}) => {
  if (!reportData) return null;

  return (
    <Modal
      title="Group Results"
      open={visible}
      onCancel={onClose}
      width="90%"
      footer={null}
      destroyOnClose
      className="report-result-dialog"
    >
      <ReportTableRows
        tableLinkRows={reportData.linkRows}
        configDefinition={reportData.configDefinition}
        reportDefinitionId={reportData.reportDefinitionId}
        lazyLoading={reportData.lazyLoading || false}
        onShowColumnDetail={onShowColumnDetail}
      />
    </Modal>
  );
};

export default ReportResultDialog;

