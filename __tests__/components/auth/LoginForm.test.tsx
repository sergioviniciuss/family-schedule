import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form in login mode', () => {
    render(<LoginForm mode="login" onModeChange={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render register form in register mode', () => {
    render(<LoginForm mode="register" onModeChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show password requirement in register mode', () => {
    render(<LoginForm mode="register" onModeChange={vi.fn()} />);
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('should call onModeChange when switching modes', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm mode="login" onModeChange={onModeChange} />);

    const switchButton = screen.getByText(/don't have an account/i);
    await user.click(switchButton);

    expect(onModeChange).toHaveBeenCalledWith('register');
  });

  it('should require email and password', () => {
    render(<LoginForm mode="login" onModeChange={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
