'use client';
import { useState } from 'react';
import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onUpdate: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, today, onUpdate, onEdit, onDelete }: HabitCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  const handleToggle = () => {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  };

  const handleDeleteConfirm = () => {
    onDelete(habit.id);
  };

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-xl border p-4 transition-all ${
        isCompleted
          ? 'bg-emerald-900 border-emerald-600'
          : 'bg-emerald-950 border-emerald-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate ${
              isCompleted ? 'text-emerald-300 line-through opacity-70' : 'text-emerald-100'
            }`}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-emerald-500 text-sm mt-0.5 truncate">{habit.description}</p>
          )}
          <div
            data-testid={`habit-streak-${slug}`}
            className="mt-2 flex items-center gap-1 text-sm"
          >
            <span className="text-lg">🔥</span>
            <span className="text-emerald-400 font-medium">{streak}</span>
            <span className="text-emerald-600">day streak</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            data-testid={`habit-complete-${slug}`}
            onClick={handleToggle}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-400 text-white'
                : 'border-emerald-600 text-transparent hover:border-emerald-400'
            }`}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && '✓'}
          </button>

          <div className="flex gap-1">
            <button
              data-testid={`habit-edit-${slug}`}
              onClick={() => onEdit(habit)}
              className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-200 bg-emerald-800 hover:bg-emerald-700 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label={`Edit ${habit.name}`}
            >
              Edit
            </button>
            <button
              data-testid={`habit-delete-${slug}`}
              onClick={() => setConfirmDelete(true)}
              className="px-2 py-1 text-xs text-red-400 hover:text-red-200 bg-red-950 hover:bg-red-900 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
              aria-label={`Delete ${habit.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 pt-3 border-t border-emerald-700">
          <p className="text-sm text-emerald-300 mb-2">Delete this habit?</p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={handleDeleteConfirm}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-sm bg-emerald-800 hover:bg-emerald-700 text-emerald-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
