import { test, expect } from '@playwright/test';
import { TEST_CLIENT } from '../fixtures/test-data';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('text=Clients')).toBeVisible();
  });

  test('renders clients page with add button', async ({ page }) => {
    await expect(page.getByTestId('add-client-btn')).toBeVisible();
    await expect(page.getByTestId('client-search')).toBeVisible();
  });

  test('opens add client modal', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await expect(page.getByTestId('add-client-modal')).toBeVisible();
    await expect(page.locator('text=Add New Client')).toBeVisible();
  });

  test('add client form has required fields', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/phone/i)).toBeVisible();
  });

  test('validates required name field', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await page.getByRole('button', { name: 'Add Client' }).click();
    await expect(page.locator('text=/Name is required|required/i')).toBeVisible();
  });

  test('creates a new client successfully', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await page.getByPlaceholder('John Doe').fill(TEST_CLIENT.full_name);
    await page.getByPlaceholder(/email/i).fill(TEST_CLIENT.email);
    await page.getByPlaceholder(/goal/i).fill(TEST_CLIENT.fitness_goal);
    await page.getByRole('button', { name: 'Add Client' }).click();
    await expect(page.locator(`text=${TEST_CLIENT.full_name}`)).toBeVisible({ timeout: 8000 });
  });

  test('search filters clients', async ({ page }) => {
    await page.getByTestId('client-search').fill('NonExistentClient99999');
    await expect(page.locator('text=No clients found')).toBeVisible();
  });

  test('fitness level filter buttons work', async ({ page }) => {
    const levels = ['beginner', 'intermediate', 'advanced'];
    for (const level of levels) {
      await page.locator(`button:has-text("${level}")`).click();
      await expect(page.locator(`button:has-text("${level}")`)).toHaveClass(/bg-neon/);
    }
  });

  test('client card navigates to detail page', async ({ page }) => {
    const clientCard = page.locator('[data-testid^="client-card-"]').first();
    const count = await clientCard.count();
    if (count > 0) {
      await clientCard.click();
      await expect(page).toHaveURL(/\/clients\/\d+/);
    }
  });

  test('closes modal on cancel', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('add-client-modal')).not.toBeVisible();
  });

  test('closes modal clicking outside', async ({ page }) => {
    await page.getByTestId('add-client-btn').click();
    await page.locator('.fixed.inset-0').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('add-client-modal')).not.toBeVisible();
  });
});
