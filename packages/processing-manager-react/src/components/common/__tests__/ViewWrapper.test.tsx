/**
 * ViewWrapper Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViewWrapper from '../ViewWrapper';

describe('ViewWrapper', () => {
  it('should render children', () => {
    render(
      <ViewWrapper>
        <div>Test Content</div>
      </ViewWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply correct className', () => {
    const { container } = render(
      <ViewWrapper>
        <div>Test Content</div>
      </ViewWrapper>
    );

    const wrapper = container.querySelector('.view-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ViewWrapper>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </ViewWrapper>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('should render complex children', () => {
    render(
      <ViewWrapper>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </ViewWrapper>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});

