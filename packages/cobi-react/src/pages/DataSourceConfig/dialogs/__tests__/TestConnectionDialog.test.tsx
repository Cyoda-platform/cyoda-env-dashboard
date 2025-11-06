/**
 * TestConnectionDialog Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestConnectionDialog from '../TestConnectionDialog';
import * as dataSourceConfigApi from '../../../../api/dataSourceConfigApi';

// Mock the API
vi.mock('../../../../api/dataSourceConfigApi');

describe('TestConnectionDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockEndpoint = {
    '@bean': 'com.cyoda.plugins.datasource.dtos.endpoint.HttpEndpointDto',
    operation: 'getUsers',
    parameters: [
      { name: 'userId', required: true, type: 'REQUEST_PARAM' },
      { name: 'limit', required: false, type: 'REQUEST_PARAM' },
    ],
  };

  const mockConnection = {
    '@bean': 'com.cyoda.plugins.datasource.dtos.connection.HttpConnectionDetailsDto',
    baseUrl: 'https://api.example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Test Endpoint Connection')).toBeInTheDocument();
  });

  it('displays parameter input fields', () => {
    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText('userId')).toBeInTheDocument();
    expect(screen.getByLabelText('limit')).toBeInTheDocument();
  });

  it('shows info alert when no parameters required', () => {
    const endpointNoParams = {
      ...mockEndpoint,
      parameters: [],
    };

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={endpointNoParams}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('No Parameters Required')).toBeInTheDocument();
  });

  it('validates required parameters', async () => {
    const user = userEvent.setup();

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const testButton = screen.getByText('Test Connection');
    await user.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter userId/i)).toBeInTheDocument();
    });
  });

  it('submits test request with parameters', async () => {
    const user = userEvent.setup();

    vi.mocked(dataSourceConfigApi.postCheckEndpointConnection).mockResolvedValue({
      data: {
        responseContent: '{"success": true}',
        responseContentType: 'application/json',
      },
    } as any);

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in required parameter
    const userIdInput = screen.getByLabelText('userId');
    await user.type(userIdInput, '123');

    // Submit
    const testButton = screen.getByText('Test Connection');
    await user.click(testButton);

    await waitFor(() => {
      expect(dataSourceConfigApi.postCheckEndpointConnection).toHaveBeenCalled();
    });
  });

  it('handles successful test response', async () => {
    const user = userEvent.setup();
    const responseContent = '{"users": [{"id": 1, "name": "John"}]}';

    vi.mocked(dataSourceConfigApi.postCheckEndpointConnection).mockResolvedValue({
      data: {
        responseContent,
        responseContentType: 'application/json',
      },
    } as any);

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const userIdInput = screen.getByLabelText('userId');
    await user.type(userIdInput, '123');

    const testButton = screen.getByText('Test Connection');
    await user.click(testButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(responseContent);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles binary response content', async () => {
    const user = userEvent.setup();

    vi.mocked(dataSourceConfigApi.postCheckEndpointConnection).mockResolvedValue({
      data: {
        responseContent: '48656c6c6f', // "Hello" in hex
        responseContentType: 'application/octet-stream',
      },
    } as any);

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const userIdInput = screen.getByLabelText('userId');
    await user.type(userIdInput, '123');

    const testButton = screen.getByText('Test Connection');
    await user.click(testButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles test error', async () => {
    const user = userEvent.setup();

    vi.mocked(dataSourceConfigApi.postCheckEndpointConnection).mockRejectedValue({
      response: {
        data: {
          message: 'Connection failed',
        },
      },
    });

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const userIdInput = screen.getByLabelText('userId');
    await user.type(userIdInput, '123');

    const testButton = screen.getByText('Test Connection');
    await user.click(testButton);

    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={mockEndpoint}
        connection={mockConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('detects SQL connection type', () => {
    const sqlConnection = {
      '@bean': 'com.cyoda.plugins.datasource.dtos.connection.SqlConnectionDetailsDto',
      jdbcUrl: 'jdbc:postgresql://localhost:5432/db',
    };

    const sqlEndpoint = {
      '@bean': 'com.cyoda.plugins.datasource.dtos.endpoint.SqlEndpointDto',
      operation: 'getUsers',
      parameters: [],
    };

    render(
      <TestConnectionDialog
        visible={true}
        endpoint={sqlEndpoint}
        connection={sqlConnection}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Test Endpoint Connection')).toBeInTheDocument();
  });
});

