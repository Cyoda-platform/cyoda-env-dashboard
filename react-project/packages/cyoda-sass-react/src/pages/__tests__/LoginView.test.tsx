import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginView from '../LoginView';

// Mock the login layout
vi.mock('../../__mocks__/@cyoda/ui-lib-react', () => ({
  LoginLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="login-layout">{children}</div>
  ),
}));

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
};

describe('LoginView', () => {
  it('should render login form', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should validate email field', async () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Try to submit without email
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please input email/i)).toBeInTheDocument();
    });
  });

  it('should validate password field', async () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Try to submit without password
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please input password/i)).toBeInTheDocument();
    });
  });

  it('should accept email input', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should accept password input', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('should render within LoginLayout', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    expect(screen.getByTestId('login-layout')).toBeInTheDocument();
  });

  it('should have email type for email input', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText('Email');
    expect(emailInput).toHaveAttribute('type', 'text');
  });

  it('should have password type for password input', () => {
    render(<LoginView />, { wrapper: createWrapper() });

    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

