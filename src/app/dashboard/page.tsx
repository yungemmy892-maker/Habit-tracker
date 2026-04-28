'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, logOut } from '@/lib/auth';
import { getHabits, setHabits } from '@/lib/storage';
import { Habit } from '@/types/habit';
import HabitForm from '@/components/habits/HabitForm';
import HabitList from '@/components/habits/HabitList';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [session, setSession] = useState<{ userId: string; email: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [today] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const sess = getCurrentSession();
    if (!sess) {
      router.replace('/login');
      return;
    }
    setSession(sess);
    const allHabits = getHabits();
    setHabitsState(allHabits.filter((h) => h.userId === sess.userId));
  }, [router]);

  const handleLogout = () => {
    logOut();
    router.replace('/login');
  };

  const handleSaveHabit = (data: { name: string; description: string; frequency: 'daily' }) => {
    if (!session) return;

    let updatedHabits: Habit[];

    if (editingHabit) {
      const updated: Habit = {
        ...editingHabit,
        name: data.name,
        description: data.description,
      };
      const allHabits = getHabits();
      const updatedAll = allHabits.map((h) => (h.id === editingHabit.id ? updated : h));
      setHabits(updatedAll);
      updatedHabits = updatedAll.filter((h) => h.userId === session.userId);
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId: session.userId,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        createdAt: new Date().toISOString(),
        completions: [],
      };
      const allHabits = getHabits();
      const updatedAll = [...allHabits, newHabit];
      setHabits(updatedAll);
      updatedHabits = updatedAll.filter((h) => h.userId === session.userId);
    }

    setHabitsState(updatedHabits);
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleUpdateHabit = (updated: Habit) => {
    if (!session) return;
    const allHabits = getHabits();
    const updatedAll = allHabits.map((h) => (h.id === updated.id ? updated : h));
    setHabits(updatedAll);
    setHabitsState(updatedAll.filter((h) => h.userId === session.userId));
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!session) return;
    const allHabits = getHabits();
    const updatedAll = allHabits.filter((h) => h.id !== habitId);
    setHabits(updatedAll);
    setHabitsState(updatedAll.filter((h) => h.userId === session.userId));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleCreateNew = () => {
    setEditingHabit(null);
    setShowForm(true);
  };

  return (
    <ProtectedRoute>
      <div data-testid="dashboard-page" className="min-h-screen bg-emerald-950">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-emerald-950 border-b border-emerald-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-lg font-bold text-emerald-300">Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-600 hidden sm:block">{session?.email}</span>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-emerald-400 hover:text-emerald-200 bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-emerald-100">Today</h2>
              <p className="text-sm text-emerald-600">{today}</p>
            </div>
            {!showForm && (
              <button
                data-testid="create-habit-button"
                onClick={handleCreateNew}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                + Add Habit
              </button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <HabitForm
                habit={editingHabit}
                onSave={handleSaveHabit}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          <HabitList
            habits={habits}
            today={today}
            onUpdate={handleUpdateHabit}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
