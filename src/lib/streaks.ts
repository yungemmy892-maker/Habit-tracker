export function calculateCurrentStreak(completions: string[], today?: string): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0];

  // Deduplicate
  const unique = Array.from(new Set(completions));

  if (!unique.includes(todayDate)) return 0;

  // Sort ascending
  const sorted = unique.sort();

  let streak = 0;
  let current = todayDate;

  while (sorted.includes(current)) {
    streak++;
    // Move to previous day
    const d = new Date(current + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    current = d.toISOString().split('T')[0];
  }

  return streak;
}
