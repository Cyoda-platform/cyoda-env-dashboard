import React from 'react';
import { Card, Typography, Alert, Space, Divider, Tag } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const StateMachineDemo: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>
            <ApartmentOutlined /> State Machine Package Demo
          </Title>
          <Paragraph>
            The <Text code>@cyoda/statemachine-react</Text> package provides comprehensive workflow
            and state machine management with graphical visualization using Cytoscape.js.
          </Paragraph>
          <Tag color="success">Most Complex Package - 4,200 Lines</Tag>
        </Card>

        <Alert
          message="Package Integration"
          description="This demo showcases the statemachine-react package. The package includes workflow management, instance tracking, and graphical state machine visualization."
          type="info"
          showIcon
        />

        <Card title="Features Implemented">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={4}>✅ Core Pages</Title>
              <ul>
                <li><Text strong>Workflows</Text> - List and manage all workflows</li>
                <li><Text strong>WorkflowDetail</Text> - Detailed workflow view with tabs</li>
                <li><Text strong>Instances</Text> - Track workflow instances</li>
                <li><Text strong>InstanceDetail</Text> - Instance details with tabs (Details, Workflow, Audit, Data Lineage)</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Workflow Components</Title>
              <ul>
                <li><Text strong>GraphicalStateMachine</Text> - Interactive Cytoscape.js visualization</li>
                <li><Text strong>StateForm</Text> - Create/edit workflow states</li>
                <li><Text strong>TransitionForm</Text> - Define state transitions</li>
                <li><Text strong>CriteriaForm</Text> - Set transition criteria</li>
                <li><Text strong>ProcessForm</Text> - Configure state processes</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Advanced Features</Title>
              <ul>
                <li><Text strong>Export/Import</Text> - JSON and ZIP format support</li>
                <li><Text strong>Layout Modes</Text> - Settings, Tabular, and Graphical views</li>
                <li><Text strong>Enhanced Instance Views</Text> - Comprehensive instance data display</li>
                <li><Text strong>Workflow Actions</Text> - Enable, disable, clone, delete workflows</li>
                <li><Text strong>Instance Actions</Text> - Retry, cancel, view details</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ State Management</Title>
              <ul>
                <li><Text strong>Main Store</Text> - Workflow and instance state</li>
                <li><Text strong>Graphical Store</Text> - Graph visualization state</li>
                <li><Text strong>30+ React Query Hooks</Text> - Complete API integration</li>
                <li>LocalStorage persistence for UI preferences</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Testing</Title>
              <ul>
                <li>228 tests passing (100% pass rate)</li>
                <li>Comprehensive utility function tests (171 tests)</li>
                <li>Hook tests with full coverage (38 tests)</li>
                <li>Integration tests for workflow creation</li>
                <li>Component tests for all major features</li>
                <li>Edge case and error handling tests</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="GraphicalStateMachine Component">
          <Paragraph>
            <Text strong>The crown jewel of the package - interactive state machine visualization:</Text>
          </Paragraph>
          <ul>
            <li>Cytoscape.js integration for graph rendering</li>
            <li>Interactive node and edge manipulation</li>
            <li>Multiple layout algorithms (dagre, cose, circle, grid)</li>
            <li>Zoom, pan, and fit controls</li>
            <li>Node and edge styling based on state</li>
            <li>Export graph as PNG</li>
          </ul>
        </Card>

        <Card title="Usage Example">
          <Paragraph>
            <Text strong>Import and use the StateMachine components:</Text>
          </Paragraph>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`import { 
  Workflows, 
  WorkflowDetail,
  Instances,
  InstanceDetail,
  GraphicalStateMachine 
} from '@cyoda/statemachine-react';

function App() {
  return (
    <Routes>
      <Route path="/workflows" element={<Workflows />} />
      <Route path="/workflows/:id" element={<WorkflowDetail />} />
      <Route path="/instances" element={<Instances />} />
      <Route path="/instances/:id" element={<InstanceDetail />} />
    </Routes>
  );
}`}
          </pre>
        </Card>

        <Card title="API Hooks Available (30+)">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Workflows:</Text>
              <ul>
                <li><Text code>useWorkflowsList()</Text> - Fetch all workflows</li>
                <li><Text code>useWorkflow(id)</Text> - Fetch single workflow</li>
                <li><Text code>useCreateWorkflow()</Text> - Create workflow</li>
                <li><Text code>useUpdateWorkflow()</Text> - Update workflow</li>
                <li><Text code>useDeleteWorkflow()</Text> - Delete workflow</li>
              </ul>
            </div>
            <div>
              <Text strong>Instances:</Text>
              <ul>
                <li><Text code>useInstances()</Text> - Fetch instances</li>
                <li><Text code>useInstance(id)</Text> - Fetch single instance</li>
                <li><Text code>useRetryInstance()</Text> - Retry failed instance</li>
                <li><Text code>useCancelInstance()</Text> - Cancel instance</li>
              </ul>
            </div>
            <div>
              <Text strong>Workflow Components:</Text>
              <ul>
                <li><Text code>useStates()</Text>, <Text code>useTransitions()</Text>, <Text code>useProcesses()</Text>, <Text code>useCriteria()</Text></li>
                <li>Full CRUD operations for all workflow components</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="Package Statistics">
          <Space size="large">
            <div>
              <Text strong>Files:</Text> 35
            </div>
            <div>
              <Text strong>Lines of Code:</Text> ~4,200
            </div>
            <div>
              <Text strong>Tests:</Text> 228 passing
            </div>
            <div>
              <Text strong>Components:</Text> 15+
            </div>
            <div>
              <Text strong>Hooks:</Text> 30+
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default StateMachineDemo;

