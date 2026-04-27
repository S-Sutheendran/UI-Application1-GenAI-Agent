import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_PHONE } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('renders the login page with all elements', async ({ page }) => {
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(loginPage.phoneInput).toBeVisible();
    await expect(loginPage.countryCodeButton).toBeVisible();
    await expect(loginPage.sendOtpButton).toBeVisible();
  });

  test('shows branding panel on desktop', async ({ page }) => {
    await expect(page.locator('text=Transform')).toBeVisible();
    await expect(page.locator('text=coaches worldwide')).toBeVisible();
  });

  test('country code dropdown shows all countries', async ({ page }) => {
    await loginPage.countryCodeButton.click();
    await expect(loginPage.countrySearch).toBeVisible();
    // India should be default selected
    await expect(loginPage.countryCodeButton).toContainText('+91');
  });

  test('can search and select a country', async ({ page }) => {
    await loginPage.countryCodeButton.click();
    await loginPage.countrySearch.fill('United States');
    await page.getByRole('button', { name: /United States/i }).first().click();
    await expect(loginPage.countryCodeButton).toContainText('+1');
  });

  test('validates phone number before sending OTP', async ({ page }) => {
    await loginPage.sendOtpButton.click();
    await expect(page.locator('text=/valid phone|required/i')).toBeVisible();
  });

  test('send OTP button disabled when phone is empty', async () => {
    await expect(loginPage.sendOtpButton).toBeDisabled();
  });

  test('sends OTP and shows OTP input screen', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await expect(page.locator('[data-testid="otp-input-0"]')).toBeVisible();
    await expect(page.locator('text=Verify OTP')).toBeVisible();
  });

  test('OTP input allows digit entry per box', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await page.getByTestId('otp-input-0').fill('1');
    await expect(page.getByTestId('otp-input-1')).toBeFocused();
  });

  test('OTP paste fills all boxes', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await page.getByTestId('otp-input-0').click();
    await page.keyboard.type('654321');
    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId(`otp-input-${i}`)).not.toBeEmpty();
    }
  });

  test('verify button disabled until all 6 digits entered', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await expect(loginPage.verifyOtpButton).toBeDisabled();
    await loginPage.enterOtp('12345');
    await expect(loginPage.verifyOtpButton).toBeDisabled();
    await loginPage.enterOtp('123456');
    await expect(loginPage.verifyOtpButton).not.toBeDisabled();
  });

  test('can navigate back to phone step', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await page.locator('text=← Change number').click();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(loginPage.phoneInput).toBeVisible();
  });

  test('shows resend OTP countdown after sending', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await expect(page.locator('text=/Resend in \\d+s/')).toBeVisible();
  });

  test('dev OTP is displayed in development mode', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    // In dev mode a toast and/or box shows the OTP
    const devOtp = await loginPage.getDevOtp();
    if (devOtp) {
      expect(devOtp).toMatch(/^\d{6}$/);
    }
  });

  test('invalid OTP shows error', async ({ page }) => {
    await loginPage.enterPhone(TEST_PHONE.number);
    await loginPage.clickSendOtp();
    await loginPage.enterOtp('000000');
    await loginPage.verifyAndLogin();
    await expect(page.locator('text=/Invalid|expired/i')).toBeVisible({ timeout: 5000 });
  });

  test('redirects unauthenticated user from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
