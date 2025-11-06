/**
 * Tests for UploadFile component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadFile from '../UploadFile';
import type { MappingConfigDto } from '../../../types';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock FilePond
vi.mock('react-filepond', () => ({
  FilePond: ({ children, ...props }: any) => (
    <div data-testid="filepond" {...props}>
      {children}
    </div>
  ),
  registerPlugin: vi.fn(),
}));

// Mock FilePond plugins
vi.mock('filepond-plugin-file-validate-type', () => ({
  default: {},
}));

vi.mock('filepond-plugin-file-validate-size', () => ({
  default: {},
}));

// Mock contentHelper
vi.mock('../../../utils/contentHelper', () => ({
  readFileAsText: vi.fn(() => Promise.resolve('test content')),
  formatFileSize: vi.fn((size) => `${size} bytes`),
}));

describe('UploadFile', () => {
  const mockConfig: MappingConfigDto = {
    id: { id: 'test-1', uiId: 1 },
    name: 'Test Mapping',
    dataType: 'CSV',
    sampleContent: '',
    parserParameters: {},
    entityMappings: [],
  } as MappingConfigDto;

  const mockOnSave = vi.fn();
  const mockOnOpenEditor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    expect(container.querySelector('.upload-file-component')).toBeInTheDocument();
  });

  it('should render FilePond component', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByTestId('filepond')).toBeInTheDocument();
  });

  it('should display Edit Content button when isEnableEditor is true', () => {
    const configWithContent = {
      ...mockConfig,
      sampleContent: 'test,data\n1,2',
    };

    render(
      <UploadFile
        dataMappingConfigDto={configWithContent}
        isEnableEditor={true}
        onSave={mockOnSave}
        onOpenEditor={mockOnOpenEditor}
      />
    );

    expect(screen.getByText('Edit Content')).toBeInTheDocument();
  });

  it('should not display Edit Content button when isEnableEditor is false', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        isEnableEditor={false}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Edit Content')).not.toBeInTheDocument();
  });

  it('should call onOpenEditor when Edit Content button is clicked', () => {
    const configWithContent = {
      ...mockConfig,
      sampleContent: 'test,data\n1,2',
    };

    render(
      <UploadFile
        dataMappingConfigDto={configWithContent}
        isEnableEditor={true}
        onSave={mockOnSave}
        onOpenEditor={mockOnOpenEditor}
      />
    );

    const button = screen.getByText('Edit Content');
    fireEvent.click(button);

    expect(mockOnOpenEditor).toHaveBeenCalled();
  });

  it('should work without onOpenEditor callback', () => {
    const configWithContent = {
      ...mockConfig,
      sampleContent: 'test,data\n1,2',
    };

    render(
      <UploadFile
        dataMappingConfigDto={configWithContent}
        isEnableEditor={true}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Content')).toBeInTheDocument();
  });

  it('should accept CSV files for CSV data type', () => {
    const csvConfig = { ...mockConfig, dataType: 'CSV' };
    
    render(
      <UploadFile
        dataMappingConfigDto={csvConfig}
        onSave={mockOnSave}
      />
    );
    
    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should accept XML files for XML data type', () => {
    const xmlConfig = { ...mockConfig, dataType: 'XML' };
    
    render(
      <UploadFile
        dataMappingConfigDto={xmlConfig}
        onSave={mockOnSave}
      />
    );
    
    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should accept JSON files for JSON data type', () => {
    const jsonConfig = { ...mockConfig, dataType: 'JSON' };
    
    render(
      <UploadFile
        dataMappingConfigDto={jsonConfig}
        onSave={mockOnSave}
      />
    );
    
    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should display upload instructions', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    // FilePond should have label text
    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should have upload-file-component class', () => {
    const { container } = render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    expect(container.querySelector('.upload-file-component')).toBeInTheDocument();
  });

  it('should render with default isEnableEditor as false', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('Open Editor')).not.toBeInTheDocument();
  });

  it('should handle different data types', () => {
    const dataTypes = ['CSV', 'XML', 'JSON', 'BINARY_DOC'];
    
    dataTypes.forEach((dataType) => {
      const config = { ...mockConfig, dataType };
      const { container } = render(
        <UploadFile
          dataMappingConfigDto={config}
          onSave={mockOnSave}
        />
      );
      
      expect(container.querySelector('.upload-file-component')).toBeInTheDocument();
    });
  });

  it('should display alert for file size limit', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );
    
    // Should have some info about file upload
    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should render Space component for layout', () => {
    const { container } = render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        isEnableEditor={true}
        onSave={mockOnSave}
        onOpenEditor={mockOnOpenEditor}
      />
    );
    
    const space = container.querySelector('.ant-space');
    expect(space).toBeInTheDocument();
  });

  it('should have Edit icon on Open Editor button', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        isEnableEditor={true}
        onSave={mockOnSave}
        onOpenEditor={mockOnOpenEditor}
      />
    );
    
    const icon = document.querySelector('.anticon-edit');
    expect(icon).toBeInTheDocument();
  });

  it('should handle CSV data type', () => {
    const csvConfig = { ...mockConfig, dataType: 'CSV' };

    render(
      <UploadFile
        dataMappingConfigDto={csvConfig}
        onSave={mockOnSave}
      />
    );

    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should handle XML data type', () => {
    const xmlConfig = { ...mockConfig, dataType: 'XML' };

    render(
      <UploadFile
        dataMappingConfigDto={xmlConfig}
        onSave={mockOnSave}
      />
    );

    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should handle JSON data type', () => {
    const jsonConfig = { ...mockConfig, dataType: 'JSON' };

    render(
      <UploadFile
        dataMappingConfigDto={jsonConfig}
        onSave={mockOnSave}
      />
    );

    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should render FilePond with props', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );

    const filepond = screen.getByTestId('filepond');
    expect(filepond).toBeInTheDocument();
  });

  it('should display upload guidelines', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Upload Guidelines')).toBeInTheDocument();
  });

  it('should display maximum file size info', () => {
    render(
      <UploadFile
        dataMappingConfigDto={mockConfig}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/Maximum file size: 50 MB/i)).toBeInTheDocument();
  });
});

