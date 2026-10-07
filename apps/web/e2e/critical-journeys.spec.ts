import { test, expect } from '@playwright/test';

test.describe('CareerScout AI E2E Journeys', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'password123';

  test('TEST 1: Logged out user sees login page on root', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Sign in to your account');
  });

  test('TEST 2: Register creates account and redirects to dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'E2E Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=E2E Test User')).toBeVisible();
  });

  test('TEST 3: Login persists after refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=E2E Test User')).toBeVisible();
  });

  test('TEST 4: Profile edits persist', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('text=Profile');
    await expect(page).toHaveURL(/\/profile/);

    // Assuming the "Basic Information" section has a phone input
    await page.click('text=Basic Information');
    // Using loose text selectors for standard forms
    const phoneInput = page.locator('input[name="phone"]');
    await phoneInput.waitFor();
    await phoneInput.fill('555-1234');
    await page.click('button:has-text("Save Changes")');

    await page.reload();
    await page.click('text=Basic Information');
    await expect(phoneInput).toHaveValue('555-1234');
  });

  test('TEST 9: Logout protects routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('text=Logout'); // assuming there is a logout button in the UI
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
