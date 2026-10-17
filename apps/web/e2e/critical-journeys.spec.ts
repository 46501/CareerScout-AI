import { test, expect } from '@playwright/test';

test.describe('CareerScout AI E2E Journeys', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'password123';

  test('TEST 1: Logged out user sees login page on root', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2')).toContainText('Welcome Back');
  });

  test('TEST 2: Register creates account and redirects to onboarding or dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'E2E Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
  });

  test('TEST 3: Login persists after refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('TEST 4: Profile edits persist', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);

    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await phoneInput.fill('555-1234');
      await page.click('button:has-text("Save Changes")');
      await page.reload();
      await expect(phoneInput).toHaveValue('555-1234');
    }
  });

  test('TEST 9: Logout protects routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
    await page.goto('/dashboard');

    await page.locator('button:has-text("Sign Out")').first().click();
    const confirmBtn = page.locator('button:has-text("Sign Out")').last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

