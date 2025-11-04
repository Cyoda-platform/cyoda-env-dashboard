import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, App, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth0 } from '@auth0/auth0-react';
import * as authApi from '@cyoda/http-api-react/api/auth';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';
import './Login.scss';

const helperStorage = new HelperStorage();

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const { loginWithRedirect, isAuthenticated, isLoading: auth0Loading, user, getAccessTokenSilently } = useAuth0();

  // Handle Auth0 authentication success
  useEffect(() => {
    const handleAuth0Success = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();

          // Call backend Auth0 login endpoint
          const response = await authApi.loginAuth0(token);
          const authData = response.data;

          // Store auth token from backend using HelperStorage
          helperStorage.set('auth', {
            token: authData.token,
            refreshToken: authData.refreshToken,
            user: authData.username,
            userId: authData.userId,
            legalEntityId: authData.legalEntityId,
            type: 'auth0'
          });

          message.success('Login successful!');
          navigate('/trino');
        } catch (error) {
          console.error('Auth0 authentication error:', error);
          message.error('Authentication failed. Please try again.');
        }
      }
    };

    handleAuth0Success();
  }, [isAuthenticated, user, getAccessTokenSilently, message, navigate]);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // Call backend login endpoint
      const response = await authApi.login(values.username, values.password);
      const authData = response.data;

      // Store auth token from backend using HelperStorage
      helperStorage.set('auth', {
        token: authData.token,
        refreshToken: authData.refreshToken,
        user: authData.username,
        userId: authData.userId,
        legalEntityId: authData.legalEntityId,
        type: 'standard'
      });

      message.success('Login successful!');
      navigate('/trino');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Login failed. Please check your credentials.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

            <Divider style={{ margin: '24px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <span style={{ color: 'rgba(209, 213, 219, 0.6)', fontSize: '13px' }}>OR</span>
            </Divider>

            <Button
              type="default"
              size="large"
              block
              loading={auth0Loading}
              onClick={handleAuth0Login}
              style={{
                borderColor: 'rgba(0, 212, 170, 0.3)',
                color: '#D1D5DB',
                background: 'rgba(26, 35, 50, 0.6)',
              }}
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

