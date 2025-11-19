/**
 * SIFT Logger Configuration View Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/ProcessingEvents/PmSiftLoggerConfView.vue
 */

import React, { useState, useEffect } from 'react';
import { Form, Switch, Transfer, Button, Divider, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useSiftLogger, useUpdateSiftLogger } from '../../hooks';
import './SiftLoggerConfView.scss';

interface TransferItem {
  key: string;
  title: string;
}

export const SiftLoggerConfView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [form, setForm] = useState({
    loggerConfigured: true,
    loggerEnabled: false,
    queues: [] as string[],
  });
  const [dataQueues, setDataQueues] = useState<TransferItem[]>([]);

  const { data: siftLoggerData } = useSiftLogger({ node: name });
  const { mutate: updateSiftLogger, isLoading } = useUpdateSiftLogger({
    onSuccess: () => {
      message.success('Data was updated');
    },
  });

  useEffect(() => {
    if (siftLoggerData) {
      const queuesAll = siftLoggerData.queuesAll || [];
      setDataQueues(
        queuesAll.map((el: string) => ({
          key: el,
          title: el.split('.').pop() || el, // shortNamePath equivalent
        }))
      );
      setForm({
        loggerConfigured: true,
        loggerEnabled: siftLoggerData.loggerEnabled || false,
        queues: siftLoggerData.queuesInclude || [],
      });
    }
  }, [siftLoggerData]);

  const handleSubmit = () => {
    const queuesExclude = dataQueues
      .map((el) => el.key)
      .filter((el) => !form.queues.includes(el));

    const data = {
      loggerEnabled: form.loggerEnabled,
      queuesExclude,
      queuesInclude: form.queues,
    };

    updateSiftLogger({ node: name, data });
  };

  return (
    <div className="pm-sift-logger-conf-view">
      <h3>Sift logger</h3>
      <Form layout="horizontal" labelCol={{ style: { width: 'auto' } }}>
        <div className="flex-row">
          <div className="flex-col">
            <Form.Item label="Sift logger configured:">
              <Switch disabled checked={form.loggerConfigured} />
            </Form.Item>
          </div>
          <div className="flex-col">
            <Form.Item label="Sift logger enabled:">
              <Switch
                checked={form.loggerEnabled}
                onChange={(checked) => setForm({ ...form, loggerEnabled: checked })}
              />
            </Form.Item>
          </div>
        </div>
      </Form>

      <Transfer
        dataSource={dataQueues}
        titles={['Exclude Queues', 'Include Queues']}
        targetKeys={form.queues}
        onChange={(targetKeys) => setForm({ ...form, queues: targetKeys as string[] })}
        render={(item) => item.title}
        showSearch
        filterOption={(inputValue, item) =>
          item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        }
        listStyle={{
          width: 'calc((100% - 200px) / 2)',
          height: 500,
        }}
      />
      <Divider />
      <div className="actions">
        <Button type="primary" onClick={handleSubmit} loading={isLoading}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default SiftLoggerConfView;

