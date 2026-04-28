import { describe, it, expect, beforeEach } from 'vitest'
import { signUp, logIn, logOut, getCurrentSession } from '@/lib/auth'
import { STORAGE_KEYS } from '@/lib/constants'

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('signUp creates a user and session', () => {
    const result = signUp('test@example.com', 'password123')
    expect(result.success).toBe(true)
    const session = getCurrentSession()
    expect(session).not.toBeNull()
    expect(session!.email).toBe('test@example.com')
  })

  it('signUp rejects duplicate email', () => {
    signUp('dup@example.com', 'pass1')
    const result = signUp('dup@example.com', 'pass2')
    expect(result.success).toBe(false)
    expect(result.error).toBe('User already exists')
  })

  it('logIn succeeds with correct credentials', () => {
    signUp('user@example.com', 'mypassword')
    logOut()
    const result = logIn('user@example.com', 'mypassword')
    expect(result.success).toBe(true)
    expect(getCurrentSession()!.email).toBe('user@example.com')
  })

  it('logIn fails with wrong password', () => {
    signUp('user@example.com', 'correct')
    logOut()
    const result = logIn('user@example.com', 'wrong')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid email or password')
  })

  it('logOut removes the session', () => {
    signUp('user@example.com', 'pass')
    expect(getCurrentSession()).not.toBeNull()
    logOut()
    expect(getCurrentSession()).toBeNull()
  })
})
