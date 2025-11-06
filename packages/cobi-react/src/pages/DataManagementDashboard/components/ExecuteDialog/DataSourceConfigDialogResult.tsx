import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal } from 'antd';
import DataSourceConfigDialogResultTabs from './DataSourceConfigDialogResultTabs';

interface DataSourceConfigDialogResultProps {
  result: any;
  dataSourceConfigDto: any;
  requestId: string;
}

export interface DataSourceConfigDialogResultRef {
  dialogVisible: boolean;
  setDialogVisible: (visible: boolean) => void;
}

const DataSourceConfigDialogResult = forwardRef<
  DataSourceConfigDialogResultRef,
  DataSourceConfigDialogResultProps
>((props, ref) => {
  const { result, dataSourceConfigDto, requestId } = props;
  const [dialogVisible, setDialogVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible,
  }));

  const computedTitle = `Result: ${dataSourceConfigDto?.name || 'N/A'}`;

  return (
    <Modal
      title={computedTitle}
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      footer={null}
      width="80%"
      destroyOnClose
    >
      <DataSourceConfigDialogResultTabs result={result} requestId={requestId} />
    </Modal>
  );
});

DataSourceConfigDialogResult.displayName = 'DataSourceConfigDialogResult';

export default DataSourceConfigDialogResult;

