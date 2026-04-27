import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const AUTH_FILE = 'playwright/.auth/coach.json';

setup('authenticate as coach', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Use test phone number
  await loginPage.enterPhone('9876543210');
  await loginPage.clickSendOtp();

  // Fetch dev OTP from response or the UI
  const devOtp = await loginPage.getDevOtp();
  if (!devOtp) {
    throw new Error('Dev OTP not visible — ensure ENVIRONMENT=development in backend');
  }

  await loginPage.enterOtp(devOtp);
  await loginPage.verifyAndLogin();
  await page.waitForURL('**/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
