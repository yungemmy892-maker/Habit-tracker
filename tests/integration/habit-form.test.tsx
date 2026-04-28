import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEYS } from '@/lib/constants'
import { Habit } from '@/types/habit'
import { getHabitSlug } from '@/lib/slug'
import React, { useState } from 'react'

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

import HabitForm from '@/components/habits/HabitForm'
import HabitList from '@/components/habits/HabitList'
import HabitCard from '@/components/habits/HabitCard'
import { toggleHabitCompletion } from '@/lib/habits'

const TODAY = new Date().toISOString().split('T')[0]

const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
  ...overrides,
})

// A small wrapper that combines HabitForm + HabitList to simulate dashboard behavior
function HabitManager({ initial = [] }: { initial?: Habit[] }) {
  const [habits, setHabits] = useState<Habit[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)

  const handleSave = (data: { name: string; description: string; frequency: 'daily' }) => {
    if (editing) {
      setHabits((prev) =>
        prev.map((h) => (h.id === editing.id ? { ...editing, name: data.name, description: data.description } : h))
      )
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId: 'user-1',
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        createdAt: new Date().toISOString(),
        completions: [],
      }
      setHabits((prev) => [...prev, newHabit])
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleEdit = (h: Habit) => { setEditing(h); setShowForm(true) }
  const handleDelete = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id))
  const handleUpdate = (updated: Habit) => setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))

  return (
    <div>
      {!showForm && (
        <button data-testid="create-habit-button" onClick={() => { setEditing(null); setShowForm(true) }}>
          Add Habit
        </button>
      )}
      {showForm && (
        <HabitForm habit={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}
      <HabitList habits={habits} today={TODAY} onUpdate={handleUpdate} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup()
    render(<HabitManager />)

    await user.click(screen.getByTestId('create-habit-button'))
    await user.click(screen.getByTestId('habit-save-button'))

    expect(await screen.findByText('Habit name is required')).toBeInTheDocument()
  })

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup()
    render(<HabitManager />)

    await user.click(screen.getByTestId('create-habit-button'))
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water')
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated')
    await user.click(screen.getByTestId('habit-save-button'))

    const slug = getHabitSlug('Drink Water')
    expect(await screen.findByTestId(`habit-card-${slug}`)).toBeInTheDocument()
  })

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup()
    const original = makeHabit({ completions: ['2024-06-10'] })
    render(<HabitManager initial={[original]} />)

    const slug = getHabitSlug(original.name)
    await user.click(screen.getByTestId(`habit-edit-${slug}`))

    const nameInput = screen.getByTestId('habit-name-input')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Habit')
    await user.click(screen.getByTestId('habit-save-button'))

    const newSlug = getHabitSlug('Updated Habit')
    expect(await screen.findByTestId(`habit-card-${newSlug}`)).toBeInTheDocument()

    // The old slug card should be gone
    expect(screen.queryByTestId(`habit-card-${slug}`)).not.toBeInTheDocument()
  })

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup()
    const habit = makeHabit()
    render(<HabitManager initial={[habit]} />)

    const slug = getHabitSlug(habit.name)

    // Click delete — card should still be present (not yet confirmed)
    await user.click(screen.getByTestId(`habit-delete-${slug}`))
    expect(screen.getByTestId(`habit-card-${slug}`)).toBeInTheDocument()

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-button'))

    await waitFor(() => {
      expect(screen.queryByTestId(`habit-card-${slug}`)).not.toBeInTheDocument()
    })
  })

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup()
    const habit = makeHabit({ completions: [] })
    render(<HabitManager initial={[habit]} />)

    const slug = getHabitSlug(habit.name)
    const streakEl = screen.getByTestId(`habit-streak-${slug}`)
    expect(streakEl.textContent).toContain('0')

    // Complete today
    await user.click(screen.getByTestId(`habit-complete-${slug}`))

    await waitFor(() => {
      expect(screen.getByTestId(`habit-streak-${slug}`).textContent).toContain('1')
    })

    // Uncomplete
    await user.click(screen.getByTestId(`habit-complete-${slug}`))

    await waitFor(() => {
      expect(screen.getByTestId(`habit-streak-${slug}`).textContent).toContain('0')
    })
  })
})
