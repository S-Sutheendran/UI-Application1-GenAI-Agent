import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.use({ storageState: 'playwright/.auth/coach.json' });

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('renders coach hero section', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=/Welcome|Coach/')).toBeVisible();
  });

  test('shows all 4 stat cards', async ({ page }) => {
    await expect(page.locator('text=Total Clients')).toBeVisible();
    await expect(page.locator('text=Active Clients')).toBeVisible();
    await expect(page.locator('text=Sessions Done')).toBeVisible();
    await expect(page.locator('text=Avg Compliance')).toBeVisible();
  });

  test('quick actions are clickable', async ({ page }) => {
    await page.locator('text=Add Client').first().click();
    await expect(page).toHaveURL(/\/clients/);
  });

  test('recent clients section renders', async ({ page }) => {
    await expect(page.locator('text=Recent Clients')).toBeVisible();
  });

  test('sidebar navigation links are present', async ({ page }) => {
    const links = ['Clients', 'Workout Plans', 'Meal Plans', 'Performance', 'Insights'];
    for (const link of links) {
      await expect(page.locator(`text=${link}`).first()).toBeVisible();
    }
  });

  test('navigates to clients page', async ({ page }) => {
    await dashboard.navigateTo('clients');
    await expect(page).toHaveURL(/\/clients/);
    await expect(page.locator('text=Clients')).toBeVisible();
  });

  test('navigates to workouts page', async ({ page }) => {
    await dashboard.navigateTo('workouts');
    await expect(page).toHaveURL(/\/workouts/);
    await expect(page.locator('text=Workout Plans')).toBeVisible();
  });

  test('navigates to meals page', async ({ page }) => {
    await dashboard.navigateTo('meals');
    await expect(page).toHaveURL(/\/meals/);
    await expect(page.locator('text=Meal Plans')).toBeVisible();
  });

  test('navigates to performance page', async ({ page }) => {
    await dashboard.navigateTo('performance');
    await expect(page).toHaveURL(/\/performance/);
    await expect(page.locator('text=Performance Analytics')).toBeVisible();
  });

  test('navigates to insights page', async ({ page }) => {
    await dashboard.navigateTo('insights');
    await expect(page).toHaveURL(/\/insights/);
    await expect(page.locator('text=Insights')).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    await dashboard.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
