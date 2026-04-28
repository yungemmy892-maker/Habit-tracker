# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits. Built with Next.js 14, React, TypeScript, and Tailwind CSS. Persistence is fully local via `localStorage`. Includes a service worker for offline support.

---

## Setup

```bash
npm install
```

---

## Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

The app runs at `http://localhost:3000`.

---

## Running the Tests

```bash
# All tests
npm test

# Unit tests only (with coverage)
npm run test:unit

# Integration/component tests only
npm run test:integration

# End-to-end tests only (requires `npm run build && npm run start` first)
npm run test:e2e
```

**Note:** E2E tests require the production server to be running on port 3000. Start it with `npm run build && npm run start` before running `npm run test:e2e`.

---

## Local Persistence Structure

All data lives in `localStorage` under three keys:

| Key | Shape | Description |
|---|---|---|
| `habit-tracker-users` | `User[]` | All registered users |
| `habit-tracker-session` | `Session \| null` | Current active session |
| `habit-tracker-habits` | `Habit[]` | All habits for all users |

**User shape:**
```ts
{ id: string; email: string; password: string; createdAt: string }
```

**Session shape:**
```ts
{ userId: string; email: string }
```

**Habit shape:**
```ts
{ id: string; userId: string; name: string; description: string; frequency: 'daily'; createdAt: string; completions: string[] }
```

Habits are filtered by `userId` at render time — each user sees only their own habits.

---

## PWA Support

- `public/manifest.json` — defines app name, icons, colors, and `display: standalone`
- `public/sw.js` — a cache-first service worker that caches the app shell on install
- `public/icons/icon-192.png` and `icon-512.png` — required PWA icons
- The service worker is registered client-side via `ServiceWorkerRegistration.tsx` in the root layout
- After first load, the app shell renders from cache when offline (no hard crash)

---

## Trade-offs and Limitations

- **Passwords are stored in plaintext** in localStorage — acceptable for a front-end-only exercise, not for production
- **No real authentication** — session is a simple localStorage object; anyone with devtools access can impersonate a user
- **localStorage is synchronous and limited** (~5MB); a real app would use a remote database
- **Single device only** — data does not sync across devices or browsers
- **Service worker caching is basic** — only the app shell is cached; dynamic route data (habits) relies on localStorage, not the service worker

---

## Test File Map

| File | Describe Block | What It Verifies |
|---|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` | Slug generation: lowercase, hyphenation, trimming, special character removal |
| `tests/unit/validators.test.ts` | `validateHabitName` | Name validation: empty rejection, 60-char limit, trimming valid values |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` | Streak logic: empty, no today, consecutive days, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` | Toggle behavior: add, remove, no mutation, no duplicates |
| `tests/unit/auth.test.ts` | `auth utilities` | signUp/logIn/logOut: session creation, duplicate rejection, wrong password |
| `tests/unit/storage.test.ts` | `storage utilities` | localStorage read/write round-trips for users, session, habits |
| `tests/integration/auth-flow.test.tsx` | `auth flow` | SignupForm and LoginForm: form submission, session creation, error messages |
| `tests/integration/habit-form.test.tsx` | `habit form` | HabitForm + HabitList: validation, create, edit, delete with confirmation, toggle streak |
| `tests/e2e/app.spec.ts` | `Habit Tracker app` | Full browser flows: splash, redirect, auth, CRUD habits, streak, persistence, logout, offline |

---

## Implementation Map

| Requirement | Implementation |
|---|---|
| Routes `/`, `/login`, `/signup`, `/dashboard` | `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/dashboard/page.tsx` |
| Splash screen with 800–2000ms delay | `src/app/page.tsx` — 1000ms `setTimeout` before redirect |
| Protected `/dashboard` route | `src/components/shared/ProtectedRoute.tsx` + redirect in `dashboard/page.tsx` |
| localStorage persistence | `src/lib/storage.ts` with keys from `src/lib/constants.ts` |
| Auth logic | `src/lib/auth.ts` |
| Habit toggle | `src/lib/habits.ts` — `toggleHabitCompletion` |
| Streak calculation | `src/lib/streaks.ts` — `calculateCurrentStreak` |
| Slug generation | `src/lib/slug.ts` — `getHabitSlug` |
| Name validation | `src/lib/validators.ts` — `validateHabitName` |
| `data-testid` attributes | All components — LoginForm, SignupForm, HabitCard, HabitForm, HabitList, SplashScreen, dashboard page |
| PWA | `public/manifest.json`, `public/sw.js`, `public/icons/`, `ServiceWorkerRegistration.tsx` |
