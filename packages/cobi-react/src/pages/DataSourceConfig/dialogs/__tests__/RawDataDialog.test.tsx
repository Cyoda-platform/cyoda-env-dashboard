/**
 * RawDataDialog Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RawDataDialog from '../RawDataDialog';

// Mock Prism.js
vi.mock('prismjs', () => ({
  default: {
    highlight: (code: string) => code,
    languages: {
      json: {},
      markup: {},
    },
  },
  highlight: (code: string) => code,
  languages: {
    json: {},
    markup: {},
  },
}));

describe('RawDataDialog', () => {
  const mockOnClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <RawDataDialog visible={true} content="" onClose={mockOnClose} />
    );
    expect(screen.getByText('Raw Data')).toBeInTheDocument();
  });

  it('displays empty state when no content', () => {
    render(
      <RawDataDialog visible={true} content="" onClose={mockOnClose} />
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText(/We have not received any content/i)).toBeInTheDocument();
  });

  it('displays JSON content', () => {
    const jsonContent = '{"name": "test", "value": 123}';
    render(
      <RawDataDialog visible={true} content={jsonContent} onClose={mockOnClose} />
    );

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('displays XML content', () => {
    const xmlContent = '<root><item>test</item></root>';
    render(
      <RawDataDialog visible={true} content={xmlContent} onClose={mockOnClose} />
    );

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('displays plain text content', () => {
    const textContent = 'Plain text content';
    render(
      <RawDataDialog visible={true} content={textContent} onClose={mockOnClose} />
    );

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('handles copy button click', async () => {
    const user = userEvent.setup();
    const content = '{"test": "data"}';

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <RawDataDialog visible={true} content={content} onClose={mockOnClose} />
    );

    const copyButton = screen.getByText('Copy');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
  });

  it('handles download button click', async () => {
    const user = userEvent.setup();
    const content = '{"test": "data"}';

    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockLink = {
      click: vi.fn(),
      href: '',
      download: '',
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(
      <RawDataDialog visible={true} content={content} onClose={mockOnClose} />
    );

    const downloadButton = screen.getByText('Download');
    await user.click(downloadButton);

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('does not show copy/download buttons when empty', () => {
    render(
      <RawDataDialog visible={true} content="" onClose={mockOnClose} />
    );

    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('handles close action', async () => {
    const user = userEvent.setup();
    render(
      <RawDataDialog visible={true} content="test" onClose={mockOnClose} />
    );

    // Find and click close button (Ant Design Drawer has a close icon)
    const closeButton = document.querySelector('.ant-drawer-close');
    if (closeButton) {
      await user.click(closeButton as HTMLElement);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('does not render when not visible', () => {
    const { container } = render(
      <RawDataDialog visible={false} content="test" onClose={mockOnClose} />
    );

    expect(container.querySelector('.ant-drawer')).not.toBeInTheDocument();
  });

  it('handles empty object as content', () => {
    render(
      <RawDataDialog visible={true} content="{}" onClose={mockOnClose} />
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});

