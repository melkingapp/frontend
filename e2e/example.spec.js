import { test, expect } from '@playwright/test';

test.describe('Example E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Melking/);
  });

  test('should navigate to join page', async ({ page }) => {
    await page.goto('/');
    // Add navigation test once routes are set up
    await expect(page.locator('body')).toBeVisible();
  });
});
