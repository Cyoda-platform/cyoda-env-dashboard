import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, App, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';
import * as authApi from '@cyoda/http-api-react/api/auth';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';
import { HelperFeatureFlags } from '@cyoda/http-api-react';
import './Login.scss';

const helperStorage = new HelperStorage();

// Determine default route based on feature flags
const getDefaultRoute = () => {
  return HelperFeatureFlags.isTrinoSqlSchemaEnabled() ? '/trino' : '/tableau/reports';
};

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const { loginWithRedirect, isAuthenticated, isLoading: auth0Loading } = useAuth0();

  // Track if we've already handled Auth0 login to prevent duplicate redirects
  const hasHandledAuth0Login = useRef(false);

  /**
   * Handle Auth0 authentication redirect.
   * Token saving is handled by Auth0TokenInitializer at the app level.
   * This effect just handles navigation after successful auth.
   */
  useEffect(() => {
    // Skip if Auth0 is still initializing, not authenticated, or already handled
    if (auth0Loading || !isAuthenticated || hasHandledAuth0Login.current) {
      return;
    }

    hasHandledAuth0Login.current = true;
    navigate(getDefaultRoute(), { replace: true });
  }, [isAuthenticated, auth0Loading, navigate]);

  // Standard username/password login
  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await authApi.login(values.username, values.password);
      const authData = response.data;

      helperStorage.set('auth', {
        token: authData.token,
        refreshToken: authData.refreshToken,
        user: authData.username,
        userId: authData.userId,
        legalEntityId: authData.legalEntityId,
        type: 'standard'
      });

      navigate(getDefaultRoute());
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Login failed. Please check your credentials.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auth0 login - just redirect, the useEffect handles the callback
  const handleAuth0Login = () => {
    loginWithRedirect();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img
              src="/assets/images/cyoda-logo-green.svg"
              alt="CYODA"
              className="logo"
            />
          </div>
        </div>

        <Card className="login-card" variant="borderless">
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Log in
              </Button>
            </Form.Item>

            <Divider style={{ margin: '24px 0' }}>
              <span style={{ fontSize: '13px' }}>OR</span>
            </Divider>

            <Button
              type="default"
              size="large"
              block
              loading={auth0Loading}
              onClick={handleAuth0Login}
            >
              Login with Auth0
            </Button>
          </Form>
        </Card>

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} Cyoda. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

