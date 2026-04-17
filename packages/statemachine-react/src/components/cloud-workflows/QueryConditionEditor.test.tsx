import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryConditionEditor } from './QueryConditionEditor';
import type { QueryCondition } from '../../gateways';

/**
 * Wraps QueryConditionEditor with state so controlled inputs behave as they do
 * in production. The spy captures every onChange call for assertions.
 */
function Controlled({
  initialValue,
  onChangeSpy,
}: {
  initialValue: QueryCondition | undefined;
  onChangeSpy: (next: QueryCondition | undefined) => void;
}) {
  const [v, setV] = useState<QueryCondition | undefined>(initialValue);
  return (
    <QueryConditionEditor
      value={v}
      onChange={(next) => { setV(next); onChangeSpy(next); }}
    />
  );
}

describe('QueryConditionEditor — empty / simple', () => {
  it('renders an "Add criterion" button when value is undefined', () => {
    render(<QueryConditionEditor value={undefined} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add criterion/i })).toBeInTheDocument();
  });

  it('clicking "Add criterion" emits a default simple condition', async () => {
    const onChange = vi.fn();
    render(<Controlled initialValue={undefined} onChangeSpy={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /add criterion/i }));
    expect(onChange).toHaveBeenCalledWith({
      type: 'simple', jsonPath: '', operation: 'EQUALS', value: '',
    });
  });

  it('renders simple-condition fields when value.type === "simple"', () => {
    render(<QueryConditionEditor
      value={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChange={vi.fn()}
    />);
    expect(screen.getByDisplayValue('$.x')).toBeInTheDocument();
    expect(screen.getByDisplayValue('y')).toBeInTheDocument();
    // Helper text:
    expect(screen.getByText(/compared as a string/i)).toBeInTheDocument();
  });

  it('typing into jsonPath emits the change', async () => {
    const onChange = vi.fn();
    render(<Controlled
      initialValue={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChangeSpy={onChange}
    />);
    const input = screen.getByDisplayValue('$.x');
    await userEvent.clear(input);
    await userEvent.type(input, '$.z');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ jsonPath: '$.z' })
    );
  });

  it('"Remove criterion" emits undefined', async () => {
    const onChange = vi.fn();
    render(<Controlled
      initialValue={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChangeSpy={onChange}
    />);
    await userEvent.click(screen.getByRole('button', { name: /remove criterion/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
