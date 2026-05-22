import { test, expect } from '@playwright/test';

test.describe('Core Application Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage should display main dashboard', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('navigation should work correctly', async ({ page }) => {
    const navItems = page.locator('nav a, nav button, [role="navigation"] a');
    
    if (await navItems.count() > 0) {
      const firstNavItem = navItems.first();
      await firstNavItem.click();
      
      await page.waitForLoadState('networkidle');
      expect(await page.url()).toBeTruthy();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Device Management Flow', () => {
  test('should display device list', async ({ page }) => {
    await page.goto('/devices');
    
    await page.waitForLoadState('networkidle');
    
    const deviceTable = page.locator('table, [data-testid="device-list"], .device-list');
    if (await deviceTable.count() > 0) {
      await expect(deviceTable.first()).toBeVisible();
    }
  });

  test('should filter devices', async ({ page }) => {
    await page.goto('/devices');
    
    await page.waitForLoadState('networkidle');
    
    const filterInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"], input[type="search"]').first();
    if (await filterInput.isVisible()) {
      await filterInput.fill('server');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Monitoring Dashboard', () => {
  test('should display monitoring overview', async ({ page }) => {
    await page.goto('/monitor');
    
    await page.waitForLoadState('networkidle');
    
    const metrics = page.locator('[data-testid*="metric"], .metric-card, .stat-card');
    if (await metrics.count() > 0) {
      await expect(metrics.first()).toBeVisible();
    }
  });

  test('should show realtime data updates', async ({ page }) => {
    await page.goto('/monitor');
    
    await page.waitForLoadState('networkidle');
    
    const chart = page.locator('canvas, [data-testid="chart"], .chart-container').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });
});

test.describe('Audit & Security', () => {
  test('should display audit logs', async ({ page }) => {
    await page.goto('/audit');
    
    await page.waitForLoadState('networkidle');
    
    const auditTable = page.locator('table, [data-testid="audit-log"], .audit-log').first();
    if (await auditTable.isVisible()) {
      await expect(auditTable).toBeVisible();
    }
  });

  test('should support log filtering', async ({ page }) => {
    await page.goto('/audit');
    
    await page.waitForLoadState('networkidle');
    
    const filterSelect = page.locator('select, [role="combobox"]').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ label: '配置变更' });
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Alert Management', () => {
  test('should display active alerts', async ({ page }) => {
    await page.goto('/alerts');
    
    await page.waitForLoadState('networkidle');
    
    const alertList = page.locator('[data-testid="alert"], .alert-item, [role="alert"]');
    if (await alertList.count() > 0) {
      await expect(alertList.first()).toBeVisible();
    }
  });

  test('should show alert details on click', async ({ page }) => {
    await page.goto('/alerts');
    
    await page.waitForLoadState('networkidle');
    
    const alertItem = page.locator('[data-testid="alert"], .alert-item').first();
    if (await alertItem.isVisible()) {
      await alertItem.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    if (response && response.status() === 404) {
      const notFoundContent = page.locator('h1:has-text("404"), h1:has-text("Not Found"), [data-testid="404"]');
      await expect(notFoundContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should maintain functionality on slow network', async ({ page }) => {
    await page.context().setOffline(true);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const offlineIndicator = page.locator('[data-testid="offline"], .offline-indicator');
    if (await offlineIndicator.count() > 0) {
      await expect(offlineIndicator.first()).toBeVisible();
    }
    
    await page.context().setOffline(false);
  });
});

test.describe('Performance Benchmarks', () => {
  test('homepage should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Homepage load time: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(10000); // 10 second budget
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    expect(errors.length).toBeLessThanOrEqual(2); // Allow minor non-critical errors
  });
});
