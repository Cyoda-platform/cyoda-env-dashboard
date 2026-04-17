import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { InstanceDetailCloud } from '../InstanceDetailCloud';

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/instances/:entityId" element={<InstanceDetailCloud />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </App>
  );
}

describe('InstanceDetailCloud — shell', () => {
  it('renders Back to Instances + the entity ID + the 5 tabs', () => {
    renderAt('/instances/eid?entityName=Customer&modelVersion=1&workflowName=wf');
    expect(screen.getByRole('button', { name: /Back to Instances/i })).toBeInTheDocument();
    expect(screen.getByText('eid')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Details/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Workflow/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Audit/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Data Lineage/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /JSON/ })).toBeInTheDocument();
  });

  it('switches tabs via clicks (stubs)', async () => {
    renderAt('/instances/eid?entityName=Customer&modelVersion=1&workflowName=wf');
    expect(screen.getByText(/Details \(todo\)/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Audit/ }));
    expect(screen.getByText(/Audit \(todo\)/)).toBeInTheDocument();
  });
});
