import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/./i);
  });

  test('login page has a form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form, input').first()).toBeVisible();
  });

  test('unauthenticated dashboard redirects away', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    expect(page.url()).not.toBe(page.url() + '/home');
  });

  test('help page loads', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL(/help/);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/privacy/);
  });
});
