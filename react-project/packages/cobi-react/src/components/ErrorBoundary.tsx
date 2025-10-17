import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
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
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An error occurred while rendering this page."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReset}>
                Reload Page
              </Button>,
            ]}
          >
            {this.state.error && (
              <div style={{ textAlign: 'left', marginTop: '20px' }}>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                    <strong>Error Details</strong>
                  </summary>
                  <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
                    )}
                  </div>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

