/**
 * Footer Component Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  beforeEach(() => {
    // Mock Date to return a fixed year
    vi.setSystemTime(new Date('2025-10-14'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render footer element', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer.c-footer');
    expect(footer).toBeInTheDocument();
  });

  it('should display copyright with current year', () => {
    render(<Footer />);

    const copyright = screen.getByText(/© 2025/);
    expect(copyright).toBeInTheDocument();
  });

  it('should render Cyoda link in left column', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link', { name: /cyoda/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', 'https://cyoda.com/');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render "Powered by Cyoda" text', () => {
    render(<Footer />);

    const poweredBy = screen.getByText(/Powered by/);
    expect(poweredBy).toBeInTheDocument();
  });

  it('should have two Cyoda links', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link', { name: /cyoda/i });
    expect(links).toHaveLength(2);
    
    // Both should point to cyoda.com
    links.forEach(link => {
      expect(link).toHaveAttribute('href', 'https://cyoda.com/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should have left column and right column', () => {
    const { container } = render(<Footer />);

    const leftColumn = container.querySelector('.left-column');
    const rightColumn = container.querySelector('.ml-auto');

    expect(leftColumn).toBeInTheDocument();
    expect(rightColumn).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer.c-footer');
    expect(footer).toBeInTheDocument();
    
    const leftColumn = footer?.querySelector('.left-column');
    const rightColumn = footer?.querySelector('.ml-auto');
    
    expect(leftColumn).toBeInTheDocument();
    expect(rightColumn).toBeInTheDocument();
  });
});

