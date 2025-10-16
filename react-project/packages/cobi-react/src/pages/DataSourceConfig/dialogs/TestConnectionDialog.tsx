import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Alert, Spin, message } from 'antd';
import { postCheckEndpointConnection } from '../../../api/dataSourceConfigApi';

interface TestConnectionDialogProps {
  visible: boolean;
  endpoint: any;
  connection: any;
  onClose: () => void;
  onSuccess: (responseContent: string) => void;
}

const TestConnectionDialog: React.FC<TestConnectionDialogProps> = ({
  visible,
  endpoint,
  connection,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userParameters, setUserParameters] = useState<any[]>([]);

  useEffect(() => {
    if (visible && endpoint) {
      // Extract parameters that need user input
      const params = (endpoint.parameters || [])
        .filter((p: any) => !p.defaultValue || p.required)
        .map((p: any) => ({
          name: p.name,
          required: p.required,
          type: p.type,
        }));
      setUserParameters(params);
      
      // Reset form
      form.resetFields();
    }
  }, [visible, endpoint, form]);

  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Convert form values to user parameters array
      const userParams = Object.keys(values).map((key) => ({
        name: key,
        value: values[key],
      }));

      // Determine connection type
      const connectionBean = connection['@bean'] || '';
      let type = 'HTTP';
      if (connectionBean.includes('Sql')) {
        type = 'SQL';
      } else if (connectionBean.includes('Workflow')) {
        type = 'WORKFLOW';
      }

      // Prepare request
      const requestData = {
        type,
        connectionDetails: connection,
        endpointDetailsDto: endpoint,
        userParameters: userParams,
      };

      // Call API
      const { data } = await postCheckEndpointConnection(requestData);
      
      // Handle response
      let responseContent = '';
      if (data.responseContentType === 'application/octet-stream') {
        // Convert hex to string for binary content
        responseContent = Buffer.from(data.responseContent, 'hex').toString('utf8');
      } else {
        responseContent = data.responseContent;
      }

      message.success('Connection test successful!');
      onSuccess(responseContent);
      onClose();
    } catch (error: any) {
      console.error('Connection test failed:', error);
      message.error(error.response?.data?.message || 'Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Test Endpoint Connection"
      open={visible}
      onOk={handleTest}
      onCancel={handleCancel}
      okText="Test Connection"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {userParameters.length === 0 ? (
          <Alert
            message="No Parameters Required"
            description="This endpoint does not require any user parameters. Click 'Test Connection' to proceed."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            <Alert
              message="Enter Parameter Values"
              description="Please provide values for the following parameters to test the connection."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form form={form} layout="vertical">
              {userParameters.map((param) => (
                <Form.Item
                  key={param.name}
                  name={param.name}
                  label={param.name}
                  rules={[
                    {
                      required: param.required,
                      message: `Please enter ${param.name}`,
                    },
                  ]}
                >
                  <Input placeholder={`Enter ${param.name}`} />
                </Form.Item>
              ))}
            </Form>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default TestConnectionDialog;

