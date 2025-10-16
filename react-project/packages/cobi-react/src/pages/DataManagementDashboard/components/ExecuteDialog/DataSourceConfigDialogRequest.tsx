import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect, useMemo } from 'react';
import { Modal, Form, Switch, Select, Button, Tabs, Empty, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DataSourceConfigDialogRequestOperation from './DataSourceConfigDialogRequestOperation';
import DataSourceConfigDialogResult, {
  DataSourceConfigDialogResultRef,
} from './DataSourceConfigDialogResult';
import DataSourceConfigDialogResultWithStatus, {
  DataSourceConfigDialogResultWithStatusRef,
} from './DataSourceConfigDialogResultWithStatus';
import DataToClipboard from '../../../../components/DataToClipboard/DataToClipboard';
import { HelperStorage } from '../../../../utils/storageHelper';
import { HelperConstants } from '../../../../utils/constants';
import * as dataSourceConfigApi from '../../../../api/dataSourceConfigApi';
import dayjs, { Dayjs } from 'dayjs';
import './DataSourceConfigDialogRequest.css';

const helperStorage = new HelperStorage();

interface DataSourceOperation {
  operation: string;
  request_fields: any;
  clientData: any;
}

interface FormData {
  data_source_operations: DataSourceOperation[];
  datasource_id: string;
  lastUpdated?: number;
}

interface FormSettings {
  operation: string | null;
  onlyState: boolean;
}

interface StatusObj {
  status: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  requestUuid: string | null;
}

export interface DataSourceConfigDialogRequestRef {
  openDialog: (dataSource: any, dataSourceConfigDto: any) => void;
}

const DataSourceConfigDialogRequest = forwardRef<DataSourceConfigDialogRequestRef, {}>((props, ref) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dataSource, setDataSource] = useState<any>({});
  const [dataSourceConfigDto, setDataSourceConfigDto] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>({});
  const [requestId, setRequestId] = useState<string>('');
  const [activeRequestFields, setActiveRequestFields] = useState<any>({});
  const [statusObj, setStatusObj] = useState<StatusObj>({
    status: '',
    startTime: null,
    endTime: null,
    requestUuid: null,
  });

  const [formSettings, setFormSettings] = useState<FormSettings>({
    operation: null,
    onlyState: false,
  });

  const [form, setForm] = useState<FormData>({
    data_source_operations: [],
    datasource_id: '',
  });

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTime = 5000;
  const doneStatuses = ['DONE', 'PARTIALLY_DONE', 'AUTH_ERROR'];

  const dataSourceConfigDialogResultRef = useRef<DataSourceConfigDialogResultRef>(null);
  const dataSourceConfigDialogResultWithStatusRef =
    useRef<DataSourceConfigDialogResultWithStatusRef>(null);

  const statusObjDefault: StatusObj = {
    status: '',
    startTime: null,
    endTime: null,
    requestUuid: null,
  };

  useImperativeHandle(ref, () => ({
    openDialog: (dataSourceValue: any, dataSourceConfigDtoValue: any) => {
      setDataSource(dataSourceValue);
      setDataSourceConfigDto(dataSourceConfigDtoValue);
      setDialogVisible(true);

      // Load saved form data from localStorage
      const storageData = helperStorage.get(
        HelperConstants.getDataSourceConfigDialogRequestKey(dataSourceConfigDtoValue.id)
      );

      if (
        storageData &&
        storageData.datasource_id &&
        storageData.lastUpdated === dataSourceConfigDtoValue.lastUpdated
      ) {
        setForm(storageData);
        if (storageData.data_source_operations.length > 0) {
          setActiveTab(storageData.data_source_operations[0].operation);
        }
      }
    },
  }));

  // Initialize form with first endpoint
  useEffect(() => {
    if (
      form.data_source_operations.length === 0 &&
      dataSourceConfigDto &&
      dataSourceConfigDto.endpoints &&
      dataSourceConfigDto.endpoints.length > 0
    ) {
      addOperation(dataSourceConfigDto.endpoints[0].operation);
    }

    setForm((prev) => ({
      ...prev,
      datasource_id: dataSourceConfigDto.id || '',
    }));
  }, [dataSourceConfigDto]);

  // Save form to localStorage
  useEffect(() => {
    if (dataSourceConfigDto.id) {
      const formToSave = {
        ...form,
        lastUpdated: dataSourceConfigDto.lastUpdated,
      };
      helperStorage.set(
        HelperConstants.getDataSourceConfigDialogRequestKey(dataSourceConfigDto.id),
        formToSave
      );
    }
  }, [form, dataSourceConfigDto]);

  // Update active request fields when tab changes
  useEffect(() => {
    if (activeTab) {
      setActiveRequestFields(getActiveRequestFieldsForOperation(activeTab) || {});
    }
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onStop(false);
    };
  }, []);

  const operationOptions = useMemo(() => {
    if (!dataSourceConfigDto.endpoints) return [];

    const usedOperations = form.data_source_operations.map((el) => el.operation);

    return dataSourceConfigDto.endpoints
      .filter((el: any) => !usedOperations.includes(el.operation))
      .map((el: any) => ({
        value: el.operation,
        label: el.operation,
      }));
  }, [dataSourceConfigDto.endpoints, form.data_source_operations]);

  const computedTitle = `Dialog Request: ${dataSourceConfigDto.name || 'N/A'}`;

  const getActiveRequestFieldsForOperation = (operation: string) => {
    if (!dataSourceConfigDto || !dataSourceConfigDto.endpoints) return {};

    const endpointDataSourceConfigDto = dataSourceConfigDto.endpoints.find(
      (el: any) => el.operation === operation
    );
    const dataSourceOperation = dataSource.operations?.find((el: any) => el.operation === operation);
    const request_fields: any = {};

    const parameters = endpointDataSourceConfigDto?.parameters || [];
    const existParameters = parameters.map((el: any) => el.name);

    parameters.forEach((el: any) => {
      request_fields[el.name] = el.defaultValue;
    });

    if (dataSourceOperation) {
      dataSourceOperation.queryFields?.forEach((name: string) => {
        if (!existParameters.includes(name)) {
          request_fields[name] = '';
        }
      });
    }

    return request_fields;
  };

  const addOperation = (operation: string) => {
    const endpointDataSourceConfigDto = dataSourceConfigDto.endpoints.find(
      (el: any) => el.operation === operation
    );
    const request_fields = getActiveRequestFieldsForOperation(operation);

    setForm((prev) => ({
      ...prev,
      data_source_operations: [
        ...prev.data_source_operations,
        {
          operation: endpointDataSourceConfigDto.operation,
          request_fields,
          clientData: {},
        },
      ],
    }));

    setActiveTab(operation);
  };

  const onClickAddOperation = () => {
    if (formSettings.operation) {
      addOperation(formSettings.operation);
      setFormSettings((prev) => ({ ...prev, operation: null }));
    }
  };

  const removeTab = (operation: string) => {
    const index = form.data_source_operations.findIndex((el) => el.operation === operation);
    const nextIndex = index === 0 ? index + 1 : index - 1;

    if (form.data_source_operations[nextIndex]) {
      setActiveTab(form.data_source_operations[nextIndex].operation);
    }

    setForm((prev) => ({
      ...prev,
      data_source_operations: prev.data_source_operations.filter((_, i) => i !== index),
    }));
  };

  const resetStatus = () => {
    setStatusObj({ ...statusObjDefault });
  };

  const onStop = (runEvent = true) => {
    setIsLoading(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const loadList = async () => {
    const { data } = await dataSourceConfigApi.getListAll();
    return data;
  };

  const onRun = async () => {
    setIsLoading(true);
    setResultData({});
    resetStatus();
    let id = '';
    setRequestId('');

    const listConfigs: any[] = await loadList();

    try {
      const formValue = JSON.parse(JSON.stringify(form));
      delete formValue.lastUpdated;

      const dataSourceConfig: any = listConfigs.find((el) => el.id === formValue.datasource_id);

      for (const dataSourceOperation of formValue.data_source_operations) {
        const endpoint = dataSourceConfig.endpoints.find(
          (endpoint: any) => endpoint.operation === dataSourceOperation.operation
        );
        if (!endpoint) continue;
        if (!endpoint.hasOwnProperty('parameters')) continue;

        for (const key of Object.keys(dataSourceOperation.request_fields)) {
          const endpointParam = endpoint.parameters.find((el: any) => el.name === key);
          if (!endpointParam) continue;
          if (!dataSourceOperation.request_fields[key]) {
            delete dataSourceOperation.request_fields[key];
          }
        }
      }

      const { data } = await dataSourceConfigApi.request(formValue);
      id = data;
      setRequestId(id);
    } catch (e) {
      console.error(e);
      onStop();
      return;
    }

    if (formSettings.onlyState) {
      dataSourceConfigDialogResultWithStatusRef.current?.setDialogVisible(true);
      setDialogVisible(false);
    }

    doRequest(id);

    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    intervalIdRef.current = setInterval(async () => {
      doRequest(id);
    }, intervalTime);
  };

  const doRequest = async (id: string) => {
    if (formSettings.onlyState) {
      if (!statusObj.startTime) {
        setStatusObj((prev) => ({
          ...prev,
          startTime: dayjs(),
          requestUuid: id,
        }));
      }
      doRequestWithStatus(id);
    } else {
      doRequestWithResult(id);
    }
  };

  const doRequestWithResult = async (id: string) => {
    if (isLoadingState) return;

    let resultLocal = null;
    try {
      setIsLoadingState(true);
      const response = await dataSourceConfigApi.result(id);
      resultLocal = response.data;
    } catch (e) {
      onStop();
      return;
    } finally {
      setIsLoadingState(false);
    }

    if (doneStatuses.includes(resultLocal.state)) {
      onStop();
      setResultData(resultLocal);
      dataSourceConfigDialogResultRef.current?.setDialogVisible(true);
    }
  };

  const doRequestWithStatus = async (id: string) => {
    if (isLoadingState) return;

    let data = null;
    try {
      setIsLoadingState(true);
      const response = await dataSourceConfigApi.resultState(id);
      data = response.data;
    } catch (e) {
      onStop();
      return;
    } finally {
      setIsLoadingState(false);
    }

    setStatusObj((prev) => ({
      ...prev,
      status: data,
    }));

    if (doneStatuses.includes(data)) {
      setStatusObj((prev) => ({
        ...prev,
        endTime: dayjs(),
      }));
      onStop();
    }
  };

  const tabItems = form.data_source_operations.map((dataSourceOperation, index) => ({
    key: dataSourceOperation.operation,
    label: dataSourceOperation.operation,
    children: (
      <DataSourceConfigDialogRequestOperation
        key={dataSourceOperation.operation}
        dataSourceOperation={dataSourceOperation}
        activeRequestFields={activeRequestFields}
        index={index}
      />
    ),
    closable: true,
  }));

  return (
    <div className="data-source-config-dialog-request">
      <Modal
        title={
          <div className="wrap-header">
            <span className="el-dialog__title">{computedTitle}</span>
            {isLoading && requestId && (
              <>
                <Divider type="vertical" />
                Request UUID:&nbsp;
                <DataToClipboard value={requestId} />
              </>
            )}
          </div>
        }
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        width="70%"
        footer={
          <div>
            <Button onClick={() => setDialogVisible(false)}>Close</Button>
            {isLoading ? (
              <Button danger onClick={() => onStop()}>
                Stop
              </Button>
            ) : (
              <Button type="primary" onClick={onRun}>
                Run
              </Button>
            )}
          </div>
        }
        destroyOnClose
      >
        <Form layout="horizontal" labelCol={{ span: 6 }}>
          <Form.Item label="Return only state">
            <Switch
              checked={formSettings.onlyState}
              onChange={(checked) =>
                setFormSettings((prev) => ({ ...prev, onlyState: checked }))
              }
            />
          </Form.Item>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Form.Item label="Operations" style={{ flex: 1, marginBottom: 0 }}>
              <Select
                value={formSettings.operation}
                onChange={(value) => setFormSettings((prev) => ({ ...prev, operation: value }))}
                placeholder="Select"
                allowClear
                options={operationOptions}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!formSettings.operation}
              onClick={onClickAddOperation}
            >
              Add
            </Button>
          </div>
        </Form>

        <Divider />

        {form.data_source_operations.length > 0 ? (
          <Tabs
            type="editable-card"
            activeKey={activeTab || undefined}
            onChange={setActiveTab}
            onEdit={(targetKey, action) => {
              if (action === 'remove') {
                removeTab(targetKey as string);
              }
            }}
            items={tabItems}
            hideAdd
          />
        ) : (
          <Empty description="Please select minimum one operation" />
        )}
      </Modal>

      <DataSourceConfigDialogResult
        ref={dataSourceConfigDialogResultRef}
        requestId={requestId}
        result={resultData}
        dataSourceConfigDto={dataSourceConfigDto}
      />

      <DataSourceConfigDialogResultWithStatus
        ref={dataSourceConfigDialogResultWithStatusRef}
        statusObj={statusObj}
        dataSourceConfigDto={dataSourceConfigDto}
        onStop={() => onStop()}
      />
    </div>
  );
});

DataSourceConfigDialogRequest.displayName = 'DataSourceConfigDialogRequest';

export default DataSourceConfigDialogRequest;

