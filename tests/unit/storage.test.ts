import { describe, it, expect, beforeEach } from 'vitest'
import { getUsers, setUsers, getSession, setSession, getHabits, setHabits } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getUsers returns empty array when no data', () => {
    expect(getUsers()).toEqual([])
  })

  it('setUsers and getUsers round-trips correctly', () => {
    const users = [{ id: '1', email: 'a@b.com', password: 'pass', createdAt: '2024-01-01' }]
    setUsers(users)
    expect(getUsers()).toEqual(users)
  })

  it('getSession returns null when no session', () => {
    expect(getSession()).toBeNull()
  })

  it('setSession and getSession round-trips correctly', () => {
    const session = { userId: 'u1', email: 'a@b.com' }
    setSession(session)
    expect(getSession()).toEqual(session)
  })

  it('setSession with null stores null', () => {
    setSession(null)
    expect(getSession()).toBeNull()
  })

  it('getHabits returns empty array when no data', () => {
    expect(getHabits()).toEqual([])
  })

  it('setHabits and getHabits round-trips correctly', () => {
    const habits = [{ id: 'h1', userId: 'u1', name: 'Test', description: '', frequency: 'daily' as const, createdAt: '2024-01-01', completions: [] }]
    setHabits(habits)
    expect(getHabits()).toEqual(habits)
  })
})
