import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Performance & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance');
    await expect(page.locator('text=Performance Analytics')).toBeVisible();
  });

  test('renders all 4 KPI cards', async ({ page }) => {
    await expect(page.locator('text=Avg Streak')).toBeVisible();
    await expect(page.locator('text=Avg Compliance')).toBeVisible();
    await expect(page.locator('text=Active Rate')).toBeVisible();
    await expect(page.locator('text=Total Athletes')).toBeVisible();
  });

  test('session completion bar chart is rendered', async ({ page }) => {
    await expect(page.locator('text=Session Completion')).toBeVisible();
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
  });

  test('compliance trend chart is rendered', async ({ page }) => {
    await expect(page.locator('text=Compliance Trend')).toBeVisible();
  });

  test('client skill radar chart is rendered', async ({ page }) => {
    await expect(page.locator('text=Client Skill Overview')).toBeVisible();
  });

  test('leaderboard section is rendered', async ({ page }) => {
    await expect(page.locator('text=Client Leaderboard')).toBeVisible();
  });
});
