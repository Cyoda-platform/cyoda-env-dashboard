import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CloudEntityTree } from '../CloudEntityTree';

describe('CloudEntityTree', () => {
  it('renders flat fields with key: value', () => {
    render(<CloudEntityTree value={{ name: 'Acme', count: 42 }} showEmpty />);
    expect(screen.getByText(/name/)).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders nested objects recursively', () => {
    render(<CloudEntityTree value={{ outer: { inner: 'v' } }} showEmpty />);
    expect(screen.getByText(/outer/)).toBeInTheDocument();
    expect(screen.getByText(/inner/)).toBeInTheDocument();
    expect(screen.getByText(/^v$/)).toBeInTheDocument();
  });

  it('renders arrays as bracketed children', () => {
    render(<CloudEntityTree value={{ list: ['a', 'b'] }} showEmpty />);
    expect(screen.getByText(/list/)).toBeInTheDocument();
    expect(screen.getByText(/^a$/)).toBeInTheDocument();
    expect(screen.getByText(/^b$/)).toBeInTheDocument();
  });

  it('hides empty/null values when showEmpty is false', () => {
    render(<CloudEntityTree value={{ name: 'Acme', empty: '', nullish: null }} showEmpty={false} />);
    expect(screen.getByText(/name/)).toBeInTheDocument();
    expect(screen.queryByText(/empty/)).not.toBeInTheDocument();
    expect(screen.queryByText(/nullish/)).not.toBeInTheDocument();
  });
});
