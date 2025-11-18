import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { StateNode, StateNodeData } from './StateNode';
import { NodeProps } from '@xyflow/react';

// Mock the SCSS import
vi.mock('./StateNode.scss', () => ({}));

// Mock @xyflow/react
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    Handle: ({ type, position, className }: any) => (
      <div data-testid={`handle-${type}`} data-position={position} className={className} />
    ),
    Position: {
      Top: 'top',
      Bottom: 'bottom',
      Left: 'left',
      Right: 'right',
    },
  };
});

describe('StateNode', () => {
  const createNodeProps = (overrides?: Partial<NodeProps<StateNodeData>>): NodeProps<StateNodeData> => ({
    id: 'state-1',
    type: 'stateNode',
    position: { x: 0, y: 0 },
    selected: false,
    data: {
      title: 'Test State',
      entityId: 'state-1',
      persisted: true,
      isCurrentState: false,
      isNoneState: false,
    },
    ...overrides,
  } as NodeProps<StateNodeData>);

  describe('Rendering', () => {
    it('should render state node', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node).toBeInTheDocument();
    });

    it('should render state title', () => {
      const props = createNodeProps();
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('Test State')).toBeInTheDocument();
    });

    it('should render state icon', () => {
      const props = createNodeProps();
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('⚪')).toBeInTheDocument();
    });

    it('should render state subtitle', () => {
      const props = createNodeProps();
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('State')).toBeInTheDocument();
    });

    it('should render target handle', () => {
      const props = createNodeProps();
      const { getByTestId } = render(<StateNode {...props} />);

      const targetHandle = getByTestId('handle-target');
      expect(targetHandle).toBeInTheDocument();
      expect(targetHandle).toHaveAttribute('data-position', 'top');
      expect(targetHandle.className).toContain('node-handle');
    });

    it('should render source handle', () => {
      const props = createNodeProps();
      const { getByTestId } = render(<StateNode {...props} />);

      const sourceHandle = getByTestId('handle-source');
      expect(sourceHandle).toBeInTheDocument();
      expect(sourceHandle).toHaveAttribute('data-position', 'bottom');
      expect(sourceHandle.className).toContain('node-handle');
    });
  });

  describe('CSS Classes', () => {
    it('should always include state-node class', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('state-node');
    });

    it('should have state-node-content class', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const content = container.querySelector('.state-node-content');
      expect(content).toBeInTheDocument();
    });

    it('should have state-icon class', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const icon = container.querySelector('.state-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should have state-title class', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const title = container.querySelector('.state-title');
      expect(title).toBeInTheDocument();
    });

    it('should have state-subtitle class', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const subtitle = container.querySelector('.state-subtitle');
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Current State', () => {
    it('should apply current-state class when isCurrentState is true', () => {
      const props = createNodeProps({
        data: {
          title: 'Current State',
          entityId: 'state-1',
          persisted: true,
          isCurrentState: true,
          isNoneState: false,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('current-state');
    });

    it('should not apply current-state class when isCurrentState is false', () => {
      const props = createNodeProps({
        data: {
          title: 'Normal State',
          entityId: 'state-1',
          persisted: true,
          isCurrentState: false,
          isNoneState: false,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).not.toContain('current-state');
    });

    it('should not apply current-state class when isCurrentState is undefined', () => {
      const props = createNodeProps({
        data: {
          title: 'Normal State',
          entityId: 'state-1',
          persisted: true,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).not.toContain('current-state');
    });
  });

  describe('None State', () => {
    it('should apply none-state class when isNoneState is true', () => {
      const props = createNodeProps({
        data: {
          title: 'None',
          entityId: 'noneState',
          persisted: true,
          isCurrentState: false,
          isNoneState: true,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('none-state');
    });

    it('should not apply none-state class when isNoneState is false', () => {
      const props = createNodeProps({
        data: {
          title: 'Normal State',
          entityId: 'state-1',
          persisted: true,
          isCurrentState: false,
          isNoneState: false,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).not.toContain('none-state');
    });

    it('should not apply none-state class when isNoneState is undefined', () => {
      const props = createNodeProps({
        data: {
          title: 'Normal State',
          entityId: 'state-1',
          persisted: true,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).not.toContain('none-state');
    });
  });

  describe('Selection State', () => {
    it('should apply selected class when selected is true', () => {
      const props = createNodeProps({ selected: true });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('selected');
    });

    it('should not apply selected class when selected is false', () => {
      const props = createNodeProps({ selected: false });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).not.toContain('selected');
    });

    it('should apply both current-state and selected classes', () => {
      const props = createNodeProps({
        selected: true,
        data: {
          title: 'Current State',
          entityId: 'state-1',
          persisted: true,
          isCurrentState: true,
          isNoneState: false,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('current-state');
      expect(node?.className).toContain('selected');
    });

    it('should apply both none-state and selected classes', () => {
      const props = createNodeProps({
        selected: true,
        data: {
          title: 'None',
          entityId: 'noneState',
          persisted: true,
          isCurrentState: false,
          isNoneState: true,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('none-state');
      expect(node?.className).toContain('selected');
    });
  });

  describe('Styling', () => {
    it('should have gradient background', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.background).toContain('linear-gradient');
    });

    it('should have border styling', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      // Just verify the node exists and has inline styles
      expect(node).toBeInTheDocument();
      expect(node?.getAttribute('style')).toContain('border');
    });

    it('should have border radius', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.borderRadius).toBe('8px');
    });

    it('should have padding', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.padding).toBe('16px 20px');
    });

    it('should have minimum width', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.minWidth).toBe('160px');
    });

    it('should have minimum height', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.minHeight).toBe('80px');
    });

    it('should have box shadow', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.boxShadow).toContain('rgba(0, 0, 0, 0.5)');
    });

    it('should have cursor pointer', () => {
      const props = createNodeProps();
      const { container } = render(<StateNode {...props} />);

      const node = container.querySelector('.state-node') as HTMLElement;
      expect(node?.style.cursor).toBe('pointer');
    });
  });

  describe('Custom Titles', () => {
    it('should display custom title', () => {
      const props = createNodeProps({
        data: {
          title: 'Custom State Name',
          entityId: 'state-1',
          persisted: true,
        },
      });
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('Custom State Name')).toBeInTheDocument();
    });

    it('should display long title', () => {
      const props = createNodeProps({
        data: {
          title: 'Very Long State Name That Might Wrap',
          entityId: 'state-1',
          persisted: true,
        },
      });
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('Very Long State Name That Might Wrap')).toBeInTheDocument();
    });

    it('should display empty title', () => {
      const props = createNodeProps({
        data: {
          title: '',
          entityId: 'state-1',
          persisted: true,
        },
      });
      const { container } = render(<StateNode {...props} />);

      const title = container.querySelector('.state-title');
      expect(title?.textContent).toBe('');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should render draft state', () => {
      const props = createNodeProps({
        data: {
          title: 'Draft',
          entityId: 'state-draft',
          persisted: true,
          isCurrentState: false,
          isNoneState: false,
        },
      });
      const { getByText } = render(<StateNode {...props} />);

      expect(getByText('Draft')).toBeInTheDocument();
    });

    it('should render current state with highlighting', () => {
      const props = createNodeProps({
        selected: true,
        data: {
          title: 'In Progress',
          entityId: 'state-in-progress',
          persisted: true,
          isCurrentState: true,
          isNoneState: false,
        },
      });
      const { getByText, container } = render(<StateNode {...props} />);

      expect(getByText('In Progress')).toBeInTheDocument();
      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('current-state');
      expect(node?.className).toContain('selected');
    });

    it('should render none state', () => {
      const props = createNodeProps({
        data: {
          title: 'None',
          entityId: 'noneState',
          persisted: true,
          isCurrentState: false,
          isNoneState: true,
        },
      });
      const { getByText, container } = render(<StateNode {...props} />);

      expect(getByText('None')).toBeInTheDocument();
      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('none-state');
    });

    it('should render selected state', () => {
      const props = createNodeProps({
        selected: true,
        data: {
          title: 'Approved',
          entityId: 'state-approved',
          persisted: true,
          isCurrentState: false,
          isNoneState: false,
        },
      });
      const { getByText, container } = render(<StateNode {...props} />);

      expect(getByText('Approved')).toBeInTheDocument();
      const node = container.querySelector('.state-node');
      expect(node?.className).toContain('selected');
    });
  });
});

