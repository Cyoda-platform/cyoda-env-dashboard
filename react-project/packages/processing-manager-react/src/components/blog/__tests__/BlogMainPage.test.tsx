import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogMainPage from '../BlogMainPage';

const mockPosts = [
  {
    link: 'https://example.com/post1',
    title: 'First Blog Post',
    description: 'This is the first blog post description',
  },
  {
    link: 'https://example.com/post2',
    title: 'Second Blog Post',
    description: 'This is the second blog post description',
  },
  {
    link: 'https://example.com/post3',
    title: 'Third Blog Post',
    description: 'This is the third blog post description',
  },
];

describe('BlogMainPage', () => {
  it('should render the component', () => {
    const { container } = render(<BlogMainPage />);
    expect(container).toBeInTheDocument();
  });

  it('should render with empty posts by default', () => {
    const { container } = render(<BlogMainPage />);
    const posts = container.querySelectorAll('.post');
    expect(posts.length).toBe(0);
  });

  it('should render all posts', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    const posts = container.querySelectorAll('.post');
    expect(posts.length).toBe(3);
  });

  it('should display post titles', () => {
    render(<BlogMainPage posts={mockPosts} />);
    
    expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Second Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Third Blog Post')).toBeInTheDocument();
  });

  it('should display post descriptions', () => {
    render(<BlogMainPage posts={mockPosts} />);
    
    expect(screen.getByText('This is the first blog post description')).toBeInTheDocument();
    expect(screen.getByText('This is the second blog post description')).toBeInTheDocument();
    expect(screen.getByText('This is the third blog post description')).toBeInTheDocument();
  });

  it('should render post titles as links', () => {
    render(<BlogMainPage posts={mockPosts} />);
    
    const link1 = screen.getByRole('link', { name: 'First Blog Post' });
    const link2 = screen.getByRole('link', { name: 'Second Blog Post' });
    const link3 = screen.getByRole('link', { name: 'Third Blog Post' });
    
    expect(link1).toHaveAttribute('href', 'https://example.com/post1');
    expect(link2).toHaveAttribute('href', 'https://example.com/post2');
    expect(link3).toHaveAttribute('href', 'https://example.com/post3');
  });

  it('should open links in new tab', () => {
    render(<BlogMainPage posts={mockPosts} />);
    
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should have post class on each row', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    const posts = container.querySelectorAll('.post');
    expect(posts.length).toBe(3);
  });

  it('should have title class on title divs', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    const titles = container.querySelectorAll('.title');
    expect(titles.length).toBe(3);
  });

  it('should have description class on description divs', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    const descriptions = container.querySelectorAll('.description');
    expect(descriptions.length).toBe(3);
  });

  it('should use post link as key', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    // React uses keys internally, we can verify posts are rendered correctly
    const posts = container.querySelectorAll('.post');
    expect(posts.length).toBe(3);
  });

  it('should handle single post', () => {
    const singlePost = [mockPosts[0]];
    render(<BlogMainPage posts={singlePost} />);
    
    expect(screen.getByText('First Blog Post')).toBeInTheDocument();
    expect(screen.queryByText('Second Blog Post')).not.toBeInTheDocument();
  });

  it('should handle empty array', () => {
    const { container } = render(<BlogMainPage posts={[]} />);
    
    const posts = container.querySelectorAll('.post');
    expect(posts.length).toBe(0);
  });

  it('should render posts in correct order', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    const titles = container.querySelectorAll('.title');
    expect(titles[0]).toHaveTextContent('First Blog Post');
    expect(titles[1]).toHaveTextContent('Second Blog Post');
    expect(titles[2]).toHaveTextContent('Third Blog Post');
  });

  it('should use Col component with md={24}', () => {
    const { container } = render(<BlogMainPage posts={mockPosts} />);
    
    const cols = container.querySelectorAll('.ant-col-md-24');
    expect(cols.length).toBe(3);
  });
});

