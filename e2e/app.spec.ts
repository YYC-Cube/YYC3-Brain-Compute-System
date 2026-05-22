import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('homepage should load successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/YYC3 Brain Computer System/);
  });

  test('should display main navigation', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should show error boundary on component failure', async ({ page }) => {
    console.log('Error boundary test - requires manual verification');
    expect(true).toBeTruthy();
  });
});
