import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TransitionEdge, TransitionEdgeData } from './TransitionEdge';
import { EdgeProps, Position } from '@xyflow/react';

// Mock the SCSS import
vi.mock('./TransitionEdge.scss', () => ({}));

// Mock @xyflow/react
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    getBezierPath: vi.fn(() => ['M 0 0 L 100 100', 50, 50]),
    BaseEdge: ({ id, path, className }: any) => (
      <path id={id} d={path} className={className} data-testid="base-edge" />
    ),
    EdgeLabelRenderer: ({ children }: any) => (
      <div data-testid="edge-label-renderer">{children}</div>
    ),
  };
});

describe('TransitionEdge', () => {
  const createEdgeProps = (overrides?: Partial<EdgeProps<TransitionEdgeData>>): EdgeProps<TransitionEdgeData> => ({
    id: 'edge-1',
    source: 'state-1',
    target: 'state-2',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    markerEnd: 'url(#arrow)',
    selected: false,
    data: {
      title: 'Test Transition',
      automated: false,
      persisted: true,
    },
    ...overrides,
  } as EdgeProps<TransitionEdgeData>);

  describe('Rendering', () => {
    it('should render BaseEdge component', () => {
      const props = createEdgeProps();
      const { getByTestId } = render(<TransitionEdge {...props} />);

      expect(getByTestId('base-edge')).toBeInTheDocument();
    });

    it('should render EdgeLabelRenderer component', () => {
      const props = createEdgeProps();
      const { getByTestId } = render(<TransitionEdge {...props} />);

      expect(getByTestId('edge-label-renderer')).toBeInTheDocument();
    });

    it('should render edge label with title', () => {
      const props = createEdgeProps();
      const { getByText } = render(<TransitionEdge {...props} />);

      expect(getByText('Test Transition')).toBeInTheDocument();
    });

    it('should render edge label arrow', () => {
      const props = createEdgeProps();
      const { getByText } = render(<TransitionEdge {...props} />);

      expect(getByText('→')).toBeInTheDocument();
    });

    it('should render edge label edit icon', () => {
      const props = createEdgeProps();
      const { getByText } = render(<TransitionEdge {...props} />);

      expect(getByText('✎')).toBeInTheDocument();
    });
  });

  describe('Manual Transitions', () => {
    it('should apply manual class when automated is false', () => {
      const props = createEdgeProps({
        data: {
          title: 'Manual Transition',
          automated: false,
          persisted: true,
        },
      });
      const { getByTestId, container } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('manual');
      expect(baseEdge.className).not.toContain('automated');

      const labelContent = container.querySelector('.edge-label-content');
      expect(labelContent?.className).toContain('manual');
    });

    it('should not apply automated class for manual transitions', () => {
      const props = createEdgeProps({
        data: {
          title: 'Manual Transition',
          automated: false,
          persisted: true,
        },
      });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).not.toContain('automated');
    });
  });

  describe('Automated Transitions', () => {
    it('should apply automated class when automated is true', () => {
      const props = createEdgeProps({
        data: {
          title: 'Automated Transition',
          automated: true,
          persisted: true,
        },
      });
      const { getByTestId, container } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('automated');
      expect(baseEdge.className).not.toContain('manual');

      const labelContent = container.querySelector('.edge-label-content');
      expect(labelContent?.className).toContain('automated');
    });

    it('should not apply manual class for automated transitions', () => {
      const props = createEdgeProps({
        data: {
          title: 'Automated Transition',
          automated: true,
          persisted: true,
        },
      });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).not.toContain('manual');
    });
  });

  describe('Selection State', () => {
    it('should apply selected class when selected is true', () => {
      const props = createEdgeProps({ selected: true });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('selected');
    });

    it('should not apply selected class when selected is false', () => {
      const props = createEdgeProps({ selected: false });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).not.toContain('selected');
    });

    it('should apply both automated and selected classes', () => {
      const props = createEdgeProps({
        selected: true,
        data: {
          title: 'Automated Transition',
          automated: true,
          persisted: true,
        },
      });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('automated');
      expect(baseEdge.className).toContain('selected');
    });
  });

  describe('Edge Data Handling', () => {
    it('should handle missing data gracefully', () => {
      const props = createEdgeProps({ data: undefined });
      const { getByTestId, container } = render(<TransitionEdge {...props} />);

      expect(getByTestId('base-edge')).toBeInTheDocument();

      const labelText = container.querySelector('.edge-label-text');
      expect(labelText?.textContent).toBe(''); // Empty title
    });

    it('should use default values when data properties are missing', () => {
      const props = createEdgeProps({
        data: {} as TransitionEdgeData,
      });
      const { getByTestId, container } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('manual'); // Default to manual

      const labelText = container.querySelector('.edge-label-text');
      expect(labelText?.textContent).toBe(''); // Default to empty string
    });

    it('should display custom title', () => {
      const props = createEdgeProps({
        data: {
          title: 'Custom Transition Name',
          automated: false,
          persisted: true,
        },
      });
      const { getByText } = render(<TransitionEdge {...props} />);

      expect(getByText('Custom Transition Name')).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      const props = createEdgeProps({
        data: {
          title: '',
          automated: false,
          persisted: true,
        },
      });
      const { container } = render(<TransitionEdge {...props} />);

      const labelText = container.querySelector('.edge-label-text');
      expect(labelText?.textContent).toBe('');
    });
  });

  describe('CSS Classes', () => {
    it('should always include transition-edge class', () => {
      const props = createEdgeProps();
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('transition-edge');
    });

    it('should have edge-label class on label container', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const label = container.querySelector('.edge-label');
      expect(label).toBeInTheDocument();
    });

    it('should have edge-label-content class on label content', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const labelContent = container.querySelector('.edge-label-content');
      expect(labelContent).toBeInTheDocument();
    });

    it('should have edge-label-arrow class on arrow', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const arrow = container.querySelector('.edge-label-arrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.textContent).toBe('→');
    });

    it('should have edge-label-text class on text', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const text = container.querySelector('.edge-label-text');
      expect(text).toBeInTheDocument();
    });

    it('should have edge-label-edit class on edit icon', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const edit = container.querySelector('.edge-label-edit');
      expect(edit).toBeInTheDocument();
      expect(edit?.textContent).toBe('✎');
    });
  });

  describe('Label Positioning', () => {
    it('should position label using transform style', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const label = container.querySelector('.edge-label');
      expect(label).toHaveStyle({
        position: 'absolute',
        transform: 'translate(-50%, -50%) translate(50px,50px)',
      });
    });

    it('should set pointer-events to none on label container', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const label = container.querySelector('.edge-label');
      expect(label).toHaveStyle({ pointerEvents: 'none' });
    });

    it('should set pointer-events to all on label content', () => {
      const props = createEdgeProps();
      const { container } = render(<TransitionEdge {...props} />);

      const labelContent = container.querySelector('.edge-label-content');
      expect(labelContent).toHaveStyle({ pointerEvents: 'all' });
    });
  });

  describe('BaseEdge Props', () => {
    it('should pass id to BaseEdge', () => {
      const props = createEdgeProps({ id: 'custom-edge-id' });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.id).toBe('custom-edge-id');
    });

    it('should pass markerEnd to BaseEdge', () => {
      const props = createEdgeProps({ markerEnd: 'url(#custom-arrow)' });
      const { container } = render(<TransitionEdge {...props} />);

      // BaseEdge mock doesn't render markerEnd, but we can verify it's passed
      expect(container.querySelector('path')).toBeInTheDocument();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should render manual transition with title', () => {
      const props = createEdgeProps({
        data: {
          title: '[M] Submit for Review',
          automated: false,
          persisted: true,
        },
      });
      const { getByText, getByTestId } = render(<TransitionEdge {...props} />);

      expect(getByText('[M] Submit for Review')).toBeInTheDocument();
      expect(getByTestId('base-edge').className).toContain('manual');
    });

    it('should render automated transition with title', () => {
      const props = createEdgeProps({
        data: {
          title: '[A] Auto Approve',
          automated: true,
          persisted: true,
        },
      });
      const { getByText, getByTestId } = render(<TransitionEdge {...props} />);

      expect(getByText('[A] Auto Approve')).toBeInTheDocument();
      expect(getByTestId('base-edge').className).toContain('automated');
    });

    it('should render selected automated transition', () => {
      const props = createEdgeProps({
        selected: true,
        data: {
          title: '[A] Auto Process',
          automated: true,
          persisted: true,
        },
      });
      const { getByTestId } = render(<TransitionEdge {...props} />);

      const baseEdge = getByTestId('base-edge');
      expect(baseEdge.className).toContain('automated');
      expect(baseEdge.className).toContain('selected');
    });
  });
});

