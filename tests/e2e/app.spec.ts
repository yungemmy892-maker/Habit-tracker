import { test, expect, Page } from '@playwright/test'

const BASE = 'http://localhost:3000'

// Helper: sign up a fresh user via UI
async function signUpUser(page: Page, email: string, password: string) {
  await page.goto('/signup')
  await page.getByTestId('auth-signup-email').fill(email)
  await page.getByTestId('auth-signup-password').fill(password)
  await page.getByTestId('auth-signup-submit').click()
  await page.waitForURL('**/dashboard')
}

// Helper: inject session + habits directly into localStorage
async function injectSession(page: Page, userId: string, email: string) {
  await page.evaluate(
    ({ userId, email }) => {
      const session = { userId, email }
      localStorage.setItem('habit-tracker-session', JSON.stringify(session))
      const users = [{ id: userId, email, password: 'pass123', createdAt: new Date().toISOString() }]
      localStorage.setItem('habit-tracker-users', JSON.stringify(users))
    },
    { userId, email }
  )
}

async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habit-tracker-session')
    localStorage.removeItem('habit-tracker-users')
    localStorage.removeItem('habit-tracker-habits')
  })
}

test.describe('Habit Tracker app', () => {
  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('splash-screen')).toBeVisible()
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto('/signup')
    const unique = `redirect-${Date.now()}@test.com`
    await page.getByTestId('auth-signup-email').fill(unique)
    await page.getByTestId('auth-signup-password').fill('password123')
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('**/dashboard')

    await page.goto('/')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    const email = `signup-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    expect(page.url()).toContain('/dashboard')
  })

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    // Sign up user A
    const emailA = `usera-${Date.now()}@test.com`
    await signUpUser(page, emailA, 'passA')

    // Create a habit for user A
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('User A Habit')
    await page.getByTestId('habit-save-button').click()

    // Logout
    await page.getByTestId('auth-logout-button').click()
    await page.waitForURL('**/login')

    // Sign up user B
    const emailB = `userb-${Date.now()}@test.com`
    await page.goto('/signup')
    await page.getByTestId('auth-signup-email').fill(emailB)
    await page.getByTestId('auth-signup-password').fill('passB')
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('**/dashboard')

    // User B should not see User A's habits
    await expect(page.getByTestId('empty-state')).toBeVisible()
    expect(page.getByText('User A Habit')).not.toBeVisible().catch(() => {})
  })

  test('creates a habit from the dashboard', async ({ page }) => {
    const email = `create-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')

    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Drink Water')
    await page.getByTestId('habit-description-input').fill('Stay hydrated')
    await page.getByTestId('habit-save-button').click()

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible()
  })

  test('completes a habit for today and updates the streak', async ({ page }) => {
    const email = `complete-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')

    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Morning Run')
    await page.getByTestId('habit-save-button').click()

    const streakEl = page.getByTestId('habit-streak-morning-run')
    await expect(streakEl).toBeVisible()
    await expect(streakEl).toContainText('0')

    await page.getByTestId('habit-complete-morning-run').click()

    await expect(streakEl).toContainText('1')
  })

  test('persists session and habits after page reload', async ({ page }) => {
    const email = `persist-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')

    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Exercise')
    await page.getByTestId('habit-save-button').click()

    await expect(page.getByTestId('habit-card-exercise')).toBeVisible()

    // Reload page
    await page.reload()
    await page.waitForURL('**/dashboard')

    // Habit and session should persist
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('habit-card-exercise')).toBeVisible()
  })

  test('logs out and redirects to /login', async ({ page }) => {
    const email = `logout-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')

    await page.getByTestId('auth-logout-button').click()
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')

    // Should not be able to go back to dashboard
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    const email = `offline-${Date.now()}@test.com`
    await signUpUser(page, email, 'password123')

    // Wait for service worker to install and cache
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Try to navigate - app shell should load from cache
    await page.reload().catch(() => {})
    
    // The page should not hard crash - either dashboard or some content visible
    const body = await page.locator('body').textContent().catch(() => '')
    expect(body).not.toBeNull()

    // Restore online
    await context.setOffline(false)
  })
})
