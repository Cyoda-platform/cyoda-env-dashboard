import React, { useMemo, useState } from 'react';
import { Descriptions, Radio, Space, Switch, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@cyoda/ui-lib-react';
import { getInstancesGateway, type ModelRef } from '../../../gateways';
import { CloudEntityTree } from '../CloudEntityTree';
import { TransitionList } from '../TransitionList';

const { Title, Text } = Typography;

export interface DetailsTabProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ entityId, modelRef, workflowName }) => {
  const [showEmpty, setShowEmpty] = useState(true);
  const [bodyView, setBodyView] = useState<'tree' | 'json'>('json');
  const query = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });

  const { data, meta } = query.data ?? {};
  const json = useMemo(() => JSON.stringify(data ?? {}, null, 2), [data]);

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Descriptions
        title="Standard fields"
        bordered
        size="small"
        column={{ xs: 1, sm: 1, md: 2 }}
        styles={{ label: { fontWeight: 600, width: 180 } }}
      >
        <Descriptions.Item label="Id">{meta?.id ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="State">{meta?.state ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Created Date">{meta?.creationDate ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Last Updated">{meta?.lastUpdateTime ?? '-'}</Descriptions.Item>
      </Descriptions>
      <TransitionList
        entityId={entityId}
        modelRef={modelRef}
        workflowName={workflowName}
        entityBody={data}
        currentState={meta?.state ?? ''}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Entity</Title>
        <Space>
          <Radio.Group value={bodyView} onChange={(e) => setBodyView(e.target.value)} options={[
            { label: 'JSON', value: 'json' },
            { label: 'Tree', value: 'tree' },
          ]} optionType="button" buttonStyle="solid" size="small" />
          {bodyView === 'tree' && (
            <>
              <Text>Show Empty Fields</Text>
              <Switch checked={showEmpty} onChange={setShowEmpty} />
            </>
          )}
        </Space>
      </div>
      {bodyView === 'tree' ? (
        <CloudEntityTree value={data ?? {}} showEmpty={showEmpty} />
      ) : (
        <CodeEditor value={json} language="json" readOnly height={480} />
      )}
    </Space>
  );
};
