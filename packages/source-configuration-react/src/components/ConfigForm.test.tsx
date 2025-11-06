/**
 * Tests for ConfigForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConfigForm from './ConfigForm';
import { useSourceConfigStore } from '../stores/sourceConfigStore';

// Mock the hooks
vi.mock('../hooks/useSourceConfig', () => ({
  useSaveConfig: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useSaveJdbcConfig: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useMappersList: () => ({
    data: [
      { className: 'StringMapper', displayName: 'String Mapper' },
      { className: 'DateMapper', displayName: 'Date Mapper' },
    ],
  }),
  useAliases: () => ({
    data: [
      { id: '1', name: 'alias1' },
      { id: '2', name: 'alias2' },
    ],
  }),
  useUploadSample: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useTestJdbcConnection: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ConfigForm', () => {
  beforeEach(() => {
    // Reset store state
    useSourceConfigStore.setState({
      isCreateDialogOpen: false,
      editingConfig: null,
    });
  });

  it('should not render when dialog is closed', () => {
    renderWithProviders(<ConfigForm />);
    expect(screen.queryByText('Create Configuration')).not.toBeInTheDocument();
  });

  it('should render when dialog is open', () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    expect(screen.getByText('Create Configuration')).toBeInTheDocument();
  });

  it('should show edit title when editing', () => {
    useSourceConfigStore.setState({
      isCreateDialogOpen: true,
      editingConfig: {
        id: '1',
        name: 'Test Config',
        fileType: 'CSV',
        columnMappingConfigs: [],
      },
    });
    renderWithProviders(<ConfigForm />);
    expect(screen.getByText('Edit Configuration')).toBeInTheDocument();
  });

  it('should render configuration name input', () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    expect(screen.getByPlaceholderText('Enter configuration name')).toBeInTheDocument();
  });

  it('should render file type selector when creating new config', () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    expect(screen.getByText('File Type')).toBeInTheDocument();
  });

  it('should allow adding column mappings', async () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    
    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Column name')).toBeInTheDocument();
    });
  });

  it('should show CSV-specific fields when CSV is selected', () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    expect(screen.getByText('Upload CSV Sample')).toBeInTheDocument();
  });

  it('should show XML-specific fields when XML is selected', async () => {
    // Start with XML config to test XML-specific fields
    useSourceConfigStore.setState({
      isCreateDialogOpen: true,
      editingConfig: {
        id: '1',
        name: 'Test XML Config',
        fileType: 'XML',
        xmlBaseXPath: '/root/element',
        columnMappingConfigs: [],
      },
    });
    renderWithProviders(<ConfigForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('/root/element')).toBeInTheDocument();
    });
  });

  it('should show JDBC-specific fields when JDBC is selected', async () => {
    // Start with JDBC config to test JDBC-specific fields
    useSourceConfigStore.setState({
      isCreateDialogOpen: true,
      editingConfig: {
        id: '1',
        name: 'Test JDBC Config',
        srcSql: 'SELECT * FROM table',
        jdbcUrl: 'jdbc:mysql://localhost:3306/database',
        username: 'user',
        password: 'pass',
        driverClassName: 'com.mysql.cj.jdbc.Driver',
        columnMappingConfigs: [],
      },
    });
    renderWithProviders(<ConfigForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('SELECT * FROM table')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('jdbc:mysql://localhost:3306/database')).toBeInTheDocument();
    });
  });

  it('should close dialog when cancel is clicked', async () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(useSourceConfigStore.getState().isCreateDialogOpen).toBe(false);
    });
  });

  it('should populate form when editing existing config', () => {
    const config = {
      id: '1',
      name: 'Test CSV Config',
      fileType: 'CSV' as const,
      columnMappingConfigs: [
        {
          csvColumnName: 'col1',
          dstAliasName: 'alias1',
          mapperClass: 'StringMapper',
          mapperFormatParam: '',
        },
      ],
    };
    
    useSourceConfigStore.setState({
      isCreateDialogOpen: true,
      editingConfig: config,
    });
    
    renderWithProviders(<ConfigForm />);
    
    const nameInput = screen.getByPlaceholderText('Enter configuration name') as HTMLInputElement;
    expect(nameInput.value).toBe('Test CSV Config');
  });

  it('should render column mapping table with correct columns', async () => {
    useSourceConfigStore.setState({ isCreateDialogOpen: true });
    renderWithProviders(<ConfigForm />);

    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);

    await waitFor(() => {
      // Use getAllByText for column headers that appear multiple times in Ant Design tables
      expect(screen.getAllByText('CSV Column Name')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Alias')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Mapper')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Parameters')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Actions')[0]).toBeInTheDocument();
    });
  });
});

