import React from 'react';
import { Card, Typography, Alert, Space, Divider, Collapse } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ApiDemo: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>
            <ApiOutlined /> HTTP API Package Demo
          </Title>
          <Paragraph>
            The <Text code>@cyoda/http-api-react</Text> package provides a complete HTTP API layer
            with React Query integration, TypeScript types, and multiple axios instances.
          </Paragraph>
        </Card>

        <Alert
          message="Foundation Package"
          description="This package serves as the foundation for all API communication. It's used by both tasks-react and statemachine-react packages."
          type="info"
          showIcon
        />

        <Card title="Features Implemented">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={4}>✅ Axios Configuration</Title>
              <ul>
                <li><Text strong>Multiple Instances</Text> - Main, Public, Processing, Grafana, AI</li>
                <li><Text strong>Interceptors</Text> - Request/response logging and error handling</li>
                <li><Text strong>Authentication</Text> - Automatic token injection</li>
                <li><Text strong>Error Handling</Text> - Centralized error processing</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ TypeScript Types</Title>
              <ul>
                <li>546 lines of comprehensive type definitions</li>
                <li>Complete API response types</li>
                <li>Request parameter types</li>
                <li>Entity and configuration types</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ API Endpoints</Title>
              <ul>
                <li><Text strong>Reports API</Text> - 30+ functions for report management</li>
                <li><Text strong>Authentication API</Text> - 11 functions for auth operations</li>
                <li><Text strong>Entities API</Text> - 25+ functions for entity CRUD</li>
                <li><Text strong>Configuration API</Text> - 30+ functions for system config</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ React Query Hooks</Title>
              <ul>
                <li>40+ custom hooks for all API operations</li>
                <li>Automatic caching and revalidation</li>
                <li>Optimistic updates</li>
                <li>Error handling and retry logic</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Utility Classes</Title>
              <ul>
                <li><Text strong>HelperStorage</Text> - LocalStorage management</li>
                <li><Text strong>HelperErrors</Text> - Error formatting and handling</li>
                <li><Text strong>serializeParams</Text> - Query parameter serialization</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Testing</Title>
              <ul>
                <li>91 comprehensive tests</li>
                <li>100% test pass rate</li>
                <li>Tests for all utility functions</li>
                <li>Mock API responses</li>
                <li>Error handling tests for all HTTP status codes</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="Usage Example">
          <Paragraph>
            <Text strong>Using the API hooks in your components:</Text>
          </Paragraph>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`import { useReports, useCreateReport } from '@cyoda/http-api-react';

function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const createReport = useCreateReport();

  const handleCreate = async (reportData) => {
    await createReport.mutateAsync(reportData);
  };

  if (isLoading) return <Spin />;

  return (
    <div>
      {reports?.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}`}
          </pre>
        </Card>

        <Card title="Available API Hooks">
          <Collapse>
            <Panel header="Reports API Hooks" key="1">
              <ul>
                <li><Text code>useReports()</Text> - Fetch all reports</li>
                <li><Text code>useReport(id)</Text> - Fetch single report</li>
                <li><Text code>useCreateReport()</Text> - Create report mutation</li>
                <li><Text code>useUpdateReport()</Text> - Update report mutation</li>
                <li><Text code>useDeleteReport()</Text> - Delete report mutation</li>
                <li><Text code>useReportData(id)</Text> - Fetch report data</li>
                <li><Text code>useReportExport(id)</Text> - Export report</li>
              </ul>
            </Panel>
            <Panel header="Authentication API Hooks" key="2">
              <ul>
                <li><Text code>useLogin()</Text> - Login mutation</li>
                <li><Text code>useLogout()</Text> - Logout mutation</li>
                <li><Text code>useCurrentUser()</Text> - Fetch current user</li>
                <li><Text code>useRefreshToken()</Text> - Refresh auth token</li>
                <li><Text code>useChangePassword()</Text> - Change password mutation</li>
              </ul>
            </Panel>
            <Panel header="Entities API Hooks" key="3">
              <ul>
                <li><Text code>useEntities()</Text> - Fetch all entities</li>
                <li><Text code>useEntity(id)</Text> - Fetch single entity</li>
                <li><Text code>useCreateEntity()</Text> - Create entity mutation</li>
                <li><Text code>useUpdateEntity()</Text> - Update entity mutation</li>
                <li><Text code>useDeleteEntity()</Text> - Delete entity mutation</li>
                <li><Text code>useEntityFields(id)</Text> - Fetch entity fields</li>
                <li><Text code>useEntityData(id)</Text> - Fetch entity data</li>
              </ul>
            </Panel>
            <Panel header="Configuration API Hooks" key="4">
              <ul>
                <li><Text code>useConfigurations()</Text> - Fetch all configurations</li>
                <li><Text code>useConfiguration(key)</Text> - Fetch single config</li>
                <li><Text code>useUpdateConfiguration()</Text> - Update config mutation</li>
                <li><Text code>useSystemSettings()</Text> - Fetch system settings</li>
                <li><Text code>useUpdateSystemSettings()</Text> - Update settings mutation</li>
              </ul>
            </Panel>
          </Collapse>
        </Card>

        <Card title="Axios Instances">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Main Instance:</Text>
              <Paragraph>Default instance for authenticated API calls</Paragraph>
            </div>
            <div>
              <Text strong>Public Instance:</Text>
              <Paragraph>For public endpoints (login, registration, etc.)</Paragraph>
            </div>
            <div>
              <Text strong>Processing Instance:</Text>
              <Paragraph>For data processing and batch operations</Paragraph>
            </div>
            <div>
              <Text strong>Grafana Instance:</Text>
              <Paragraph>For Grafana dashboard integration</Paragraph>
            </div>
            <div>
              <Text strong>AI Instance:</Text>
              <Paragraph>For AI/ML service integration</Paragraph>
            </div>
          </Space>
        </Card>

        <Card title="Package Statistics">
          <Space size="large">
            <div>
              <Text strong>Files:</Text> 21
            </div>
            <div>
              <Text strong>Lines of Code:</Text> ~2,500
            </div>
            <div>
              <Text strong>Tests:</Text> 91 passing
            </div>
            <div>
              <Text strong>API Functions:</Text> 100+
            </div>
            <div>
              <Text strong>Hooks:</Text> 40+
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ApiDemo;

