/**
 * ErrorBoundary Component
 * Catches and handles React errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Collapse } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;

      return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
          <Result
            status="error"
            icon={<BugOutlined />}
            title="Oops! Something went wrong"
            subTitle="We're sorry for the inconvenience. The application encountered an unexpected error."
            extra={[
              <Button 
                type="primary" 
                key="reset" 
                onClick={this.handleReset}
                icon={<ReloadOutlined />}
              >
                Try Again
              </Button>,
              <Button 
                key="reload" 
                onClick={this.handleReload}
                icon={<ReloadOutlined />}
              >
                Reload Page
              </Button>,
              <Button 
                key="home" 
                onClick={this.handleGoHome}
                icon={<HomeOutlined />}
              >
                Go Home
              </Button>,
            ]}
          >
            {isDevelopment && this.state.error && (
              <div style={{ textAlign: 'left', marginTop: 24 }}>
                <Collapse>
                  <Panel header="Error Details (Development Mode)" key="1">
                    <Paragraph>
                      <Text strong>Error Message:</Text>
                      <br />
                      <Text code>{this.state.error.toString()}</Text>
                    </Paragraph>

                    {this.state.error.stack && (
                      <Paragraph>
                        <Text strong>Stack Trace:</Text>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '12px', 
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '300px'
                        }}>
                          {this.state.error.stack}
                        </pre>
                      </Paragraph>
                    )}

                    {this.state.errorInfo && (
                      <Paragraph>
                        <Text strong>Component Stack:</Text>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '12px', 
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '300px'
                        }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </Paragraph>
                    )}
                  </Panel>
                </Collapse>
              </div>
            )}

            {!isDevelopment && (
              <Paragraph style={{ marginTop: 24 }}>
                <Text type="secondary">
                  If this problem persists, please contact support with the following error ID:
                  <br />
                  <Text code>{Date.now().toString(36)}</Text>
                </Text>
              </Paragraph>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

