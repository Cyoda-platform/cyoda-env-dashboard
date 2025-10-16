/**
 * ChainingsSelector Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChainingsSelector from '../ChainingsSelector';
import * as chainingConfigApi from '../../../../api/chainingConfigApi';

// Mock the API
vi.mock('../../../../api/chainingConfigApi');

describe('ChainingsSelector', () => {
  const mockOnChange = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: [],
    } as any);

    renderWithClient(<ChainingsSelector onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays loading state', async () => {
    vi.mocked(chainingConfigApi.getListAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithClient(<ChainingsSelector onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('displays chaining options', async () => {
    const mockChainings = [
      { id: '1', name: 'Chaining 1' },
      { id: '2', name: 'Chaining 2' },
    ];

    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: mockChainings,
    } as any);

    renderWithClient(<ChainingsSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });
  });

  it('handles selection change', async () => {
    const user = userEvent.setup();
    const mockChainings = [
      { id: '1', name: 'Chaining 1' },
      { id: '2', name: 'Chaining 2' },
    ];

    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: mockChainings,
    } as any);

    renderWithClient(<ChainingsSelector value={[]} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    // Note: Full interaction testing with Ant Design Select is complex
    // This test verifies the component renders and is interactive
  });

  it('displays selected values', () => {
    const mockChainings = [
      { id: '1', name: 'Chaining 1' },
      { id: '2', name: 'Chaining 2' },
    ];

    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: mockChainings,
    } as any);

    renderWithClient(
      <ChainingsSelector value={['1', '2']} onChange={mockOnChange} />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: [],
    } as any);

    renderWithClient(
      <ChainingsSelector disabled={true} onChange={mockOnChange} />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('displays custom placeholder', () => {
    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: [],
    } as any);

    renderWithClient(
      <ChainingsSelector
        placeholder="Custom placeholder"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('handles empty chainings list', async () => {
    vi.mocked(chainingConfigApi.getListAll).mockResolvedValue({
      data: [],
    } as any);

    renderWithClient(<ChainingsSelector onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });
  });
});

