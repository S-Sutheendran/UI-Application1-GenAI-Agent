import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Insights & Habits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/insights');
    await expect(page.locator('text=Insights & Habits')).toBeVisible();
  });

  test('renders client selection panel', async ({ page }) => {
    await expect(page.locator('text=Select Athlete')).toBeVisible();
  });

  test('shows empty state when no client selected', async ({ page }) => {
    await expect(page.locator('text=Select a client')).toBeVisible();
  });

  test('shows habit tracker when client is selected', async ({ page }) => {
    const clientBtn = page.locator('button').filter({ has: page.locator('text=/Active/i') }).first();
    const count = await clientBtn.count();
    if (count > 0) {
      await clientBtn.click();
      await expect(page.locator('text=Weekly Habit Tracker')).toBeVisible();
    }
  });

  test('shows AI recommendations panel when client selected', async ({ page }) => {
    const clientBtns = page.locator('.space-y-2 button');
    const count = await clientBtns.count();
    if (count > 0) {
      await clientBtns.first().click();
      await expect(page.locator('text=AI Recommendations')).toBeVisible();
    }
  });

  test('shows health indicators when client selected', async ({ page }) => {
    const clientBtns = page.locator('.space-y-2 button');
    const count = await clientBtns.count();
    if (count > 0) {
      await clientBtns.first().click();
      await expect(page.locator('text=Health Indicators')).toBeVisible();
      await expect(page.locator('text=Recovery Score')).toBeVisible();
    }
  });
});
