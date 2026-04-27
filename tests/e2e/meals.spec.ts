import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Meal Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/meals');
    await expect(page.locator('text=Meal Plans')).toBeVisible();
  });

  test('renders meals page', async ({ page }) => {
    await expect(page.locator('text=New Meal Plan')).toBeVisible();
    await expect(page.locator('text=/\\d+ nutrition plans/')).toBeVisible();
  });

  test('opens create meal plan modal', async ({ page }) => {
    await page.locator('text=New Meal Plan').click();
    await expect(page.locator('text=Create Meal Plan')).toBeVisible();
  });

  test('macro templates are displayed', async ({ page }) => {
    await page.locator('text=New Meal Plan').click();
    await expect(page.locator('text=Quick Templates')).toBeVisible();
    const templates = ['Fat Loss', 'Muscle Gain', 'Maintenance', 'Keto'];
    for (const t of templates) {
      await expect(page.locator(`text=${t}`)).toBeVisible();
    }
  });

  test('applying a template populates calorie fields', async ({ page }) => {
    await page.locator('text=New Meal Plan').click();
    await page.locator('text=Muscle Gain').first().click();
    await expect(page.locator('input[type="number"]').first()).toHaveValue('3000');
  });

  test('protein, carbs, and fat fields exist', async ({ page }) => {
    await page.locator('text=New Meal Plan').click();
    await expect(page.locator('text=/Protein/i')).toBeVisible();
    await expect(page.locator('text=/Carbs/i')).toBeVisible();
    await expect(page.locator('text=/Fat/i')).toBeVisible();
  });

  test('shows macro ring visualization on existing plans', async ({ page }) => {
    const planCards = page.locator('.glass-card').filter({ has: page.locator('text=/kcal\\/day/') });
    const count = await planCards.count();
    if (count > 0) {
      await expect(planCards.first().locator('svg')).toBeVisible();
    }
  });
});
