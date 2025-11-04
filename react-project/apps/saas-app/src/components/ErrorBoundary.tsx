import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
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
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '50px', 
          maxWidth: '800px', 
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Alert
            message="Application Error"
            description={
              <div>
                <p><strong>Error:</strong> {this.state.error?.message}</p>
                {this.state.errorInfo && (
                  <details style={{ marginTop: '16px' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                      Error Details
                    </summary>
                    <pre style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      padding: '10px', 
                      overflow: 'auto',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Button type="primary" onClick={this.handleReset}>
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

