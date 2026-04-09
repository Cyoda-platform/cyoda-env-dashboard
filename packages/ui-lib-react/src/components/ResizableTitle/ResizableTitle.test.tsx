import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResizableTitle } from './ResizableTitle';

// Mock react-resizable
vi.mock('react-resizable', () => ({
  Resizable: ({ children, onResize, width }: any) => (
    <div data-testid="resizable" data-width={width} data-onresize={!!onResize}>
      {children}
      <span
        className="react-resizable-handle react-resizable-handle-se"
        data-testid="resize-handle"
        onClick={(e) => {
          e.stopPropagation();
          if (onResize) {
            onResize(e, { size: { width: width + 10, height: 0 } });
          }
        }}
      />
    </div>
  ),
}));

describe('ResizableTitle', () => {
  describe('Without Resize Capability', () => {
    it('should render plain th when width is not provided', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle>Column Header</ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(th).toHaveTextContent('Column Header');
      expect(screen.queryByTestId('resizable')).not.toBeInTheDocument();
    });

    it('should render plain th when onResize is not provided', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100}>Column Header</ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(screen.queryByTestId('resizable')).not.toBeInTheDocument();
    });

    it('should render plain th when both width and onResize are not provided', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle>Column Header</ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(screen.queryByTestId('resizable')).not.toBeInTheDocument();
    });
  });

  describe('With Resize Capability', () => {
    it('should render Resizable component when width and onResize are provided', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByTestId('resizable')).toBeInTheDocument();
      expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
    });

    it('should pass width to Resizable component', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={150} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const resizable = screen.getByTestId('resizable');
      expect(resizable).toHaveAttribute('data-width', '150');
    });

    it('should handle string width by converting to number', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width="200" onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const resizable = screen.getByTestId('resizable');
      expect(resizable).toHaveAttribute('data-width', '200');
    });

    it('should call onResize when resize handle is clicked', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('resize-handle');
      fireEvent.click(handle);

      expect(onResize).toHaveBeenCalled();
    });

    it('should render th inside Resizable component', () => {
      const onResize = vi.fn();

      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(th).toHaveTextContent('Column Header');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward additional props to th element', () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle className="custom-class" data-test="custom-data">
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toHaveClass('custom-class');
      expect(th).toHaveAttribute('data-test', 'custom-data');
    });

    it('should forward additional props to th element when resizable', () => {
      const onResize = vi.fn();

      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle
                width={100}
                onResize={onResize}
                className="custom-class"
                data-test="custom-data"
              >
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toHaveClass('custom-class');
      expect(th).toHaveAttribute('data-test', 'custom-data');
    });

    it('should not pass width and onResize to th element', () => {
      const onResize = vi.fn();

      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).not.toHaveAttribute('width');
      expect(th).not.toHaveAttribute('onResize');
    });
  });

  describe('Edge Cases', () => {
    it('should handle width of 0', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={0} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      // Width of 0 is falsy, so should render plain th
      expect(screen.queryByTestId('resizable')).not.toBeInTheDocument();
    });

    it('should handle very large width', () => {
      const onResize = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={10000} onResize={onResize}>
                Column Header
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const resizable = screen.getByTestId('resizable');
      expect(resizable).toHaveAttribute('data-width', '10000');
    });

    it('should handle empty children', () => {
      const onResize = vi.fn();

      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize} />
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(th).toBeEmptyDOMElement();
    });

    it('should handle complex children', () => {
      const onResize = vi.fn();

      const { container } = render(
        <table>
          <thead>
            <tr>
              <ResizableTitle width={100} onResize={onResize}>
                <div>
                  <span>Complex</span>
                  <strong>Header</strong>
                </div>
              </ResizableTitle>
            </tr>
          </thead>
        </table>
      );

      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Header')).toBeInTheDocument();
    });
  });
});

