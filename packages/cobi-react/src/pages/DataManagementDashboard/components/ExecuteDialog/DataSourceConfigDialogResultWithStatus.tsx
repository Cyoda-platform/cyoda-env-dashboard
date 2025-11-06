import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import { Modal, Row, Col, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import DataToClipboard from '../../../../components/DataToClipboard/DataToClipboard';
import dayjs, { Dayjs } from 'dayjs';

interface StatusObj {
  status: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  requestUuid: string | null;
}

interface DataSourceConfigDialogResultWithStatusProps {
  statusObj: StatusObj;
  dataSourceConfigDto: any;
  onStop?: () => void;
}

export interface DataSourceConfigDialogResultWithStatusRef {
  dialogVisible: boolean;
  setDialogVisible: (visible: boolean) => void;
}

const DataSourceConfigDialogResultWithStatus = forwardRef<
  DataSourceConfigDialogResultWithStatusRef,
  DataSourceConfigDialogResultWithStatusProps
>((props, ref) => {
  const { statusObj, dataSourceConfigDto, onStop } = props;
  const [dialogVisible, setDialogVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    dialogVisible,
    setDialogVisible,
  }));

  useEffect(() => {
    if (!dialogVisible && onStop) {
      onStop();
    }
  }, [dialogVisible, onStop]);

  const computedTitle = `Result: ${dataSourceConfigDto?.name || 'N/A'}`;

  const startedAt = useMemo(() => {
    if (!statusObj.startTime) return '';
    return statusObj.startTime.format('DD.MM.YYYY H:mm:ss');
  }, [statusObj.startTime]);

  const endAt = useMemo(() => {
    if (!statusObj.endTime) return '';
    return statusObj.endTime.format('DD.MM.YYYY H:mm:ss');
  }, [statusObj.endTime]);

  const duration = useMemo(() => {
    if (!statusObj.endTime || !statusObj.startTime) return '';
    return `${statusObj.endTime.diff(statusObj.startTime, 'seconds')} seconds`;
  }, [statusObj.endTime, statusObj.startTime]);

  return (
    <Modal
      title={computedTitle}
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="header">
        <Row className="row" gutter={20}>
          <Col span={24}>
            <strong>Status:</strong> {statusObj.status}{' '}
            {!endAt && <Spin indicator={<LoadingOutlined spin />} />}
          </Col>
        </Row>
        {statusObj.requestUuid && (
          <Row className="row" gutter={20}>
            <Col span={24}>
              <strong>Request UUID:</strong> <DataToClipboard value={statusObj.requestUuid} />
            </Col>
          </Row>
        )}
      </div>
      <Divider />
      <Row className="row" gutter={20}>
        <Col span={8}>
          <strong>Started At:</strong> {startedAt}
        </Col>
        <Col span={8}>
          <strong>Ended At:</strong> {endAt}
        </Col>
        <Col span={8}>
          <strong>Duration:</strong> {duration}
        </Col>
      </Row>
    </Modal>
  );
});

DataSourceConfigDialogResultWithStatus.displayName = 'DataSourceConfigDialogResultWithStatus';

export default DataSourceConfigDialogResultWithStatus;

