import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { NameInputDialog } from './NameInputDialog';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

describe('NameInputDialog', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn();
    onCancel = vi.fn();
  });

  it('does not render when closed', () => {
    renderWithApp(
      <NameInputDialog
        open={false}
        title="Rename workflow"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    expect(screen.queryByText('Rename workflow')).not.toBeInTheDocument();
  });

  it('renders the title and input when open', () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Rename workflow"
        existingNames={[]}
        initialValue="OldName"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    expect(screen.getByText('Rename workflow')).toBeInTheDocument();
    expect(screen.getByLabelText(/new name/i)).toHaveValue('OldName');
  });

  it('submits the entered name and closes', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={['A', 'B']}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText(/new name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'NewName');
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(onSubmit).toHaveBeenCalledWith('NewName');
  });

  it('blocks submit and shows an error when name is empty', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit and shows an error when name conflicts with an existing one', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={['Premium', 'Standard']}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText(/new name/i);
    await userEvent.type(input, 'Premium');
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancel button calls onCancel', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('clears stale form state when reopened', async () => {
    const { rerender } = renderWithApp(
      <NameInputDialog
        open
        title="Rename"
        existingNames={[]}
        initialValue="Foo"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText(/new name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Bar');

    // Close, then reopen with a different initial value.
    rerender(
      <App>
        <NameInputDialog
          open={false}
          title="Rename"
          existingNames={[]}
          initialValue="Foo"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </App>
    );
    rerender(
      <App>
        <NameInputDialog
          open
          title="Rename"
          existingNames={[]}
          initialValue=""
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </App>
    );

    expect(screen.getByLabelText(/new name/i)).toHaveValue('');
  });

  it('blocks submit when name is whitespace-only (trim-before-required)', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    await userEvent.type(screen.getByLabelText(/new name/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows submitting the allowedValue without a uniqueness error', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Rename"
        existingNames={['Premium', 'Standard']}
        initialValue="Premium"
        allowedValue="Premium"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    // The dialog opens with Premium pre-filled and Premium also in existingNames.
    // Without the allowedValue, this would reject as a conflict against itself.
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(onSubmit).toHaveBeenCalledWith('Premium');
  });
});
