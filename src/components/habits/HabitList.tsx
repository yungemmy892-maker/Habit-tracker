'use client';
import { Habit } from '@/types/habit';
import HabitCard from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  today: string;
  onUpdate: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitList({ habits, today, onUpdate, onEdit, onDelete }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="text-center py-16 text-emerald-600"
      >
        <div className="text-5xl mb-4">🌱</div>
        <p className="text-lg font-medium text-emerald-400">No habits yet</p>
        <p className="text-sm mt-1">Add your first habit to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          today={today}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
