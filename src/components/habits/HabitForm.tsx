'use client';
import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
  habit?: Habit | null;
  onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel: () => void;
}

export default function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [frequency] = useState<'daily'>('daily');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
    }
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) {
      setNameError(result.error);
      return;
    }
    setNameError(null);
    onSave({ name: result.value, description: description.trim(), frequency });
  };

  return (
    <div data-testid="habit-form" className="bg-emerald-900 rounded-xl p-5 border border-emerald-700">
      <h2 className="text-lg font-semibold text-emerald-200 mb-4">
        {habit ? 'Edit Habit' : 'New Habit'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="habit-name" className="block text-sm font-medium text-emerald-400 mb-1">
            Name
          </label>
          <input
            id="habit-name"
            type="text"
            data-testid="habit-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-emerald-800 border border-emerald-600 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Drink Water"
          />
          {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="habit-description" className="block text-sm font-medium text-emerald-400 mb-1">
            Description <span className="text-emerald-600 font-normal">(optional)</span>
          </label>
          <input
            id="habit-description"
            type="text"
            data-testid="habit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-emerald-800 border border-emerald-600 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Short description"
          />
        </div>

        <div>
          <label htmlFor="habit-frequency" className="block text-sm font-medium text-emerald-400 mb-1">
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            value={frequency}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-emerald-800 border border-emerald-600 text-emerald-100 focus:outline-none"
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            data-testid="habit-save-button"
            className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {habit ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
