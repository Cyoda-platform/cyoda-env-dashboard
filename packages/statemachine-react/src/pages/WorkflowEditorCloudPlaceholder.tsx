/**
 * WorkflowEditorCloudPlaceholder — temporary page rendered at
 *   /workflow/:entityName/:modelVersion/:workflowName
 *   /workflow/:entityName/:modelVersion/new
 *
 * Sub-branch 4 replaces this with the real cloud workflow editor. This
 * placeholder is here so Edit and Create navigation from the Workflows page
 * has a target that confirms the route params were threaded correctly.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Space, Result } from 'antd';

const { Title, Text, Paragraph } = Typography;

export const WorkflowEditorCloudPlaceholder: React.FC = () => {
  const params = useParams<{ entityName: string; modelVersion: string; workflowName?: string }>();
  const isNew = params.workflowName === undefined;

  return (
    <div style={{ padding: 24 }}>
      <Result
        status="info"
        title={isNew ? 'Create new workflow (placeholder)' : 'Edit workflow (placeholder)'}
        subTitle="The cloud workflow editor lands in sub-branch 4."
        extra={
          <Space direction="vertical">
            <Title level={5}>Route params</Title>
            <Text>
              entityName: <Text code>{params.entityName}</Text>
            </Text>
            <Text>
              modelVersion: <Text code>{params.modelVersion}</Text>
            </Text>
            {!isNew && (
              <Text>
                workflowName: <Text code>{params.workflowName}</Text>
              </Text>
            )}
            <Paragraph>
              <Link to="/workflows">← Back to workflows</Link>
            </Paragraph>
          </Space>
        }
      />
    </div>
  );
};
