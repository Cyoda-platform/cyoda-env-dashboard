import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { AdvancedSearchDrawer } from '../AdvancedSearchDrawer';

function renderIt(props: { open: boolean; onSearch?: any; onClose?: any }) {
  return render(
    <App>
      <AdvancedSearchDrawer
        open={props.open}
        onClose={props.onClose ?? (() => {})}
        onSearch={props.onSearch ?? (() => {})}
      />
    </App>
  );
}

describe('AdvancedSearchDrawer', () => {
  it('renders nothing when closed', () => {
    renderIt({ open: false });
    expect(screen.queryByText(/Advanced Search/)).not.toBeInTheDocument();
  });

  it('renders the editor when open', async () => {
    renderIt({ open: true });
    expect(await screen.findByText(/Advanced Search/)).toBeInTheDocument();
  });

  it('Search click with valid JSON calls onSearch with parsed value', async () => {
    const onSearch = vi.fn();
    renderIt({ open: true, onSearch });
    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '{{"type":"simple"}');
    await userEvent.click(screen.getByRole('button', { name: /^Search$/ }));
    expect(onSearch).toHaveBeenCalledWith({ type: 'simple' });
  });

  it('Search button is disabled and error shown when JSON parse fails', async () => {
    renderIt({ open: true });
    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'not-json');
    expect(await screen.findByText(/Invalid JSON/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Search$/ })).toBeDisabled();
  });
});
