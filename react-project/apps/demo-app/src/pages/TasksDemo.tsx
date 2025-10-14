import React from 'react';
import { Card, Typography, Alert, Space, Divider } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const TasksDemo: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>
            <CheckSquareOutlined /> Tasks Package Demo
          </Title>
          <Paragraph>
            The <Text code>@cyoda/tasks-react</Text> package provides a complete task management
            solution with filtering, pagination, and bulk operations.
          </Paragraph>
        </Card>

        <Alert
          message="Package Integration"
          description="This demo showcases the tasks-react package. In a real application, this would connect to your backend API."
          type="info"
          showIcon
        />

        <Card title="Features Implemented">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={4}>✅ Core Components</Title>
              <ul>
                <li><Text strong>TasksFilter</Text> - Advanced filtering with status, priority, and date range</li>
                <li><Text strong>TasksGrid</Text> - Paginated task list with sorting and actions</li>
                <li><Text strong>TaskDetail</Text> - Detailed view with edit functionality</li>
                <li><Text strong>BulkUpdateForm</Text> - Update multiple tasks at once</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ State Management</Title>
              <ul>
                <li><Text strong>Zustand Store</Text> - Client state with localStorage persistence</li>
                <li><Text strong>React Query Hooks</Text> - Server state management for tasks</li>
                <li>Optimistic updates for better UX</li>
                <li>Automatic cache invalidation</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Features</Title>
              <ul>
                <li>Real-time task updates toggle</li>
                <li>Advanced filtering (status, priority, assignee, dates)</li>
                <li>Pagination and sorting</li>
                <li>Bulk operations (update, delete)</li>
                <li>Task creation and editing</li>
                <li>Responsive design</li>
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={4}>✅ Testing</Title>
              <ul>
                <li>53 comprehensive tests</li>
                <li>100% test pass rate</li>
                <li>Component tests with React Testing Library</li>
                <li>Integration tests for workflows</li>
                <li>Edge case tests for error handling</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="Usage Example">
          <Paragraph>
            <Text strong>Import and use the Tasks component:</Text>
          </Paragraph>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`import { Tasks } from '@cyoda/tasks-react';

function App() {
  return <Tasks />;
}`}
          </pre>
        </Card>

        <Card title="API Hooks Available">
          <ul>
            <li><Text code>useTasks()</Text> - Fetch paginated tasks list</li>
            <li><Text code>useTask(id)</Text> - Fetch single task details</li>
            <li><Text code>useCreateTask()</Text> - Create new task mutation</li>
            <li><Text code>useUpdateTask()</Text> - Update task mutation</li>
            <li><Text code>useDeleteTask()</Text> - Delete task mutation</li>
            <li><Text code>useBulkUpdateTasks()</Text> - Bulk update mutation</li>
          </ul>
        </Card>

        <Card title="Package Statistics">
          <Space size="large">
            <div>
              <Text strong>Files:</Text> 21
            </div>
            <div>
              <Text strong>Lines of Code:</Text> ~1,600
            </div>
            <div>
              <Text strong>Tests:</Text> 53 passing
            </div>
            <div>
              <Text strong>Components:</Text> 5
            </div>
            <div>
              <Text strong>Hooks:</Text> 6
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default TasksDemo;

