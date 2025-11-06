import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
// TODO: Replace with actual @cyoda/ui-lib-react once available
import { LoginLayout } from '../__mocks__/@cyoda/ui-lib-react';
import './LoginView.css';

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      // TODO: Implement actual login with authStore
      // For now, just simulate login
      console.log('Login with:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success('Login successful');
      navigate('/cyoda-sass/trino');
    } catch (error) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <div className="login-view-container">
        <div className="login-view-card">
          <img
            className="login-view-logo"
            src="/cyoda-logo.svg"
            alt="Cyoda Logo"
            onError={(e) => {
              // Fallback if logo not found
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input Email' }]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input Password' }]}
            >
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>

            <div className="login-view-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Login
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </LoginLayout>
  );
};

export default LoginView;

