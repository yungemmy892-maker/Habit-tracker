import { describe, it, expect } from 'vitest'
import { toggleHabitCompletion } from '@/lib/habits'
import { Habit } from '@/types/habit'

const baseHabit: Habit = {
  id: 'test-id',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
}

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2024-06-15')
    expect(result.completions).toContain('2024-06-15')
    expect(result.completions).toHaveLength(1)
  })

  it('removes a completion date when the date already exists', () => {
    const habit: Habit = { ...baseHabit, completions: ['2024-06-15'] }
    const result = toggleHabitCompletion(habit, '2024-06-15')
    expect(result.completions).not.toContain('2024-06-15')
    expect(result.completions).toHaveLength(0)
  })

  it('does not mutate the original habit object', () => {
    const habit: Habit = { ...baseHabit, completions: ['2024-06-14'] }
    const result = toggleHabitCompletion(habit, '2024-06-15')
    expect(habit.completions).toHaveLength(1)
    expect(habit.completions).not.toContain('2024-06-15')
    expect(result).not.toBe(habit)
    expect(result.completions).not.toBe(habit.completions)
  })

  it('does not return duplicate completion dates', () => {
    const habit: Habit = { ...baseHabit, completions: ['2024-06-14', '2024-06-14'] }
    const result = toggleHabitCompletion(habit, '2024-06-15')
    const counts: Record<string, number> = {}
    result.completions.forEach((d) => { counts[d] = (counts[d] || 0) + 1 })
    Object.values(counts).forEach((c) => expect(c).toBe(1))
  })
})
