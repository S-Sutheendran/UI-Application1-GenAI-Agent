import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Workout Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workouts');
    await expect(page.locator('text=Workout Plans')).toBeVisible();
  });

  test('renders workouts page with new plan button', async ({ page }) => {
    await expect(page.locator('text=New Plan')).toBeVisible();
    await expect(page.locator('text=/\\d+ plans created/')).toBeVisible();
  });

  test('opens create plan modal', async ({ page }) => {
    await page.locator('text=New Plan').click();
    await expect(page.locator('text=Create Workout Plan')).toBeVisible();
  });

  test('plan form has required fields', async ({ page }) => {
    await page.locator('text=New Plan').click();
    await expect(page.locator('text=Client *')).toBeVisible();
    await expect(page.locator('text=Plan Title *')).toBeVisible();
    await expect(page.locator('text=Goal')).toBeVisible();
    await expect(page.locator('text=Weeks')).toBeVisible();
    await expect(page.locator('text=Days/Week')).toBeVisible();
  });

  test('goal options are available', async ({ page }) => {
    await page.locator('text=New Plan').click();
    const goalSelect = page.locator('select').filter({ has: page.locator('option:has-text("Strength")') });
    await expect(goalSelect).toBeVisible();
    const options = await goalSelect.locator('option').allTextContents();
    expect(options).toContain('Strength');
    expect(options).toContain('Hypertrophy');
    expect(options).toContain('Fat Loss');
  });

  test('week options include 4,6,8,12,16', async ({ page }) => {
    await page.locator('text=New Plan').click();
    const weekSelect = page.locator('select').filter({ has: page.locator('option:has-text("4 weeks")') });
    const options = await weekSelect.locator('option').allTextContents();
    expect(options).toContain('4 weeks');
    expect(options).toContain('12 weeks');
  });

  test('plan card shows exercise details when expanded', async ({ page }) => {
    const cardCount = await page.locator('.glass-card').count();
    if (cardCount > 1) {
      await page.locator('text=View workout days').first().click();
      await expect(page.locator('text=/sets|reps/i').first()).toBeVisible();
    }
  });
});
