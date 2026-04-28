import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { STORAGE_KEYS } from '@/lib/constants'

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com')
    await user.type(screen.getByTestId('auth-signup-password'), 'password123')
    await user.click(screen.getByTestId('auth-signup-submit'))

    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null')
    expect(session).not.toBeNull()
    expect(session.email).toBe('test@example.com')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup()

    // Pre-seed a user
    const existingUser = {
      id: 'existing-id',
      email: 'taken@example.com',
      password: 'pass',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([existingUser]))

    render(<SignupForm />)

    await user.type(screen.getByTestId('auth-signup-email'), 'taken@example.com')
    await user.type(screen.getByTestId('auth-signup-password'), 'password123')
    await user.click(screen.getByTestId('auth-signup-submit'))

    expect(await screen.findByText('User already exists')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup()

    // Pre-seed a user
    const existingUser = {
      id: 'user-123',
      email: 'user@example.com',
      password: 'mypassword',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([existingUser]))

    render(<LoginForm />)

    await user.type(screen.getByTestId('auth-login-email'), 'user@example.com')
    await user.type(screen.getByTestId('auth-login-password'), 'mypassword')
    await user.click(screen.getByTestId('auth-login-submit'))

    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null')
    expect(session).not.toBeNull()
    expect(session.userId).toBe('user-123')
    expect(session.email).toBe('user@example.com')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByTestId('auth-login-email'), 'wrong@example.com')
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpass')
    await user.click(screen.getByTestId('auth-login-submit'))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
