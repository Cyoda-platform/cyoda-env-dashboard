import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigWorkflow } from './ConfigWorkflow';
import { useWorkflow } from '../hooks/useStatemachine';

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useWorkflow: vi.fn(),
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, beforeMount }: any) => {
    // Call beforeMount if provided to test theme definition
    if (beforeMount) {
      const mockMonaco = {
        editor: {
          defineTheme: vi.fn(),
        },
      };
      beforeMount(mockMonaco);
    }
    return <div data-testid="monaco-editor">{value}</div>;
  },
}));

const mockUseWorkflow = vi.mocked(useWorkflow);

describe('ConfigWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      mockUseWorkflow.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      // Check for Spin component by class
      const spinElement = container.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error alert when there is an error', () => {
      mockUseWorkflow.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(screen.getByText('Error Loading Configuration')).toBeInTheDocument();
      expect(screen.getByText('Failed to load workflow configuration. Please try again.')).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should display warning alert when workflow data is not available', () => {
      mockUseWorkflow.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(screen.getByText('No Configuration Available')).toBeInTheDocument();
      expect(screen.getByText('Workflow configuration data is not available.')).toBeInTheDocument();
    });

    it('should display warning alert when workflow data is undefined', () => {
      mockUseWorkflow.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(screen.getByText('No Configuration Available')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      entityClassName: 'TestEntity',
      states: [
        { id: 'state-1', name: 'Initial' },
        { id: 'state-2', name: 'Final' },
      ],
      transitions: [
        { id: 'transition-1', name: 'Move', startStateId: 'state-1', endStateId: 'state-2' },
      ],
    };

    it('should display Monaco editor with workflow JSON when data is available', () => {
      mockUseWorkflow.mockReturnValue({
        data: mockWorkflow,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(screen.getByText('Workflow Configuration')).toBeInTheDocument();
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should display formatted JSON in Monaco editor', () => {
      mockUseWorkflow.mockReturnValue({
        data: mockWorkflow,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      const editor = screen.getByTestId('monaco-editor');
      // Check that editor contains the workflow data (mock doesn't preserve formatting)
      expect(editor.textContent).toContain('"id": "workflow-1"');
      expect(editor.textContent).toContain('"name": "Test Workflow"');
      expect(editor.textContent).toContain('"entityClassName": "TestEntity"');
    });

    it('should display info alert with description', () => {
      mockUseWorkflow.mockReturnValue({
        data: mockWorkflow,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(screen.getByText('Workflow Configuration')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is the raw JSON configuration of the workflow. You can use this for debugging or exporting the workflow structure.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call useWorkflow with correct parameters for persisted workflow', () => {
      mockUseWorkflow.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-123" persistedType="persisted" />);

      expect(mockUseWorkflow).toHaveBeenCalledWith('persisted', 'workflow-123', true);
    });

    it('should call useWorkflow with correct parameters for draft workflow', () => {
      mockUseWorkflow.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-456" persistedType="draft" />);

      expect(mockUseWorkflow).toHaveBeenCalledWith('draft', 'workflow-456', true);
    });

    it('should call useWorkflow with correct parameters for runtime workflow', () => {
      mockUseWorkflow.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-789" persistedType="runtime" />);

      expect(mockUseWorkflow).toHaveBeenCalledWith('runtime', 'workflow-789', true);
    });

    it('should enable query when workflowId is provided', () => {
      mockUseWorkflow.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      expect(mockUseWorkflow).toHaveBeenCalledWith('persisted', 'workflow-1', true);
    });
  });

  describe('Complex Workflow Data', () => {
    it('should handle workflow with nested objects', () => {
      const complexWorkflow = {
        id: 'workflow-1',
        name: 'Complex Workflow',
        metadata: {
          author: 'Test User',
          version: '1.0.0',
          tags: ['test', 'complex'],
        },
        states: [
          {
            id: 'state-1',
            name: 'Initial',
            properties: {
              color: 'blue',
              icon: 'start',
            },
          },
        ],
      };

      mockUseWorkflow.mockReturnValue({
        data: complexWorkflow,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      const editor = screen.getByTestId('monaco-editor');
      // Check that editor contains nested data
      expect(editor.textContent).toContain('"metadata"');
      expect(editor.textContent).toContain('"author": "Test User"');
      expect(editor.textContent).toContain('"tags"');
    });

    it('should handle workflow with arrays', () => {
      const workflowWithArrays = {
        id: 'workflow-1',
        name: 'Workflow with Arrays',
        states: ['state-1', 'state-2', 'state-3'],
        transitions: ['transition-1', 'transition-2'],
        criteria: ['criteria-1'],
      };

      mockUseWorkflow.mockReturnValue({
        data: workflowWithArrays,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      const editor = screen.getByTestId('monaco-editor');
      // Check that editor contains array data
      expect(editor.textContent).toContain('"states"');
      expect(editor.textContent).toContain('"state-1"');
      expect(editor.textContent).toContain('"transitions"');
    });

    it('should handle empty workflow object', () => {
      const emptyWorkflow = {};

      mockUseWorkflow.mockReturnValue({
        data: emptyWorkflow,
        isLoading: false,
        error: null,
      } as any);

      render(<ConfigWorkflow workflowId="workflow-1" persistedType="persisted" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveTextContent('{}');
    });
  });
});

