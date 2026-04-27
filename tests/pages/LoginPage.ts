import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly countryCodeButton: Locator;
  readonly countrySearch: Locator;
  readonly phoneInput: Locator;
  readonly sendOtpButton: Locator;
  readonly verifyOtpButton: Locator;
  readonly devOtpBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.countryCodeButton = page.getByTestId('country-code-button');
    this.countrySearch = page.getByTestId('country-search');
    this.phoneInput = page.getByTestId('phone-number-input');
    this.sendOtpButton = page.getByTestId('send-otp-button');
    this.verifyOtpButton = page.getByTestId('verify-otp-button');
    this.devOtpBox = page.locator('[class*="dev_otp"], .glass-card:has-text("DEV OTP")');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveTitle(/FitCoach/);
  }

  async selectCountry(searchTerm: string) {
    await this.countryCodeButton.click();
    await this.countrySearch.fill(searchTerm);
    await this.page.getByRole('button', { name: new RegExp(searchTerm, 'i') }).first().click();
  }

  async enterPhone(number: string) {
    await this.phoneInput.fill(number);
  }

  async clickSendOtp() {
    await this.sendOtpButton.click();
    await this.page.waitForSelector('[data-testid="otp-input-0"]', { timeout: 5000 });
  }

  async enterOtp(otp: string) {
    for (let i = 0; i < otp.length; i++) {
      await this.page.getByTestId(`otp-input-${i}`).fill(otp[i]);
    }
  }

  async pasteOtp(otp: string) {
    await this.page.getByTestId('otp-input-0').click();
    await this.page.keyboard.type(otp);
  }

  async verifyAndLogin() {
    await this.verifyOtpButton.click();
  }

  async fullLogin(phone: string, otp: string) {
    await this.enterPhone(phone);
    await this.clickSendOtp();
    await this.enterOtp(otp);
    await this.verifyAndLogin();
    await this.page.waitForURL('**/dashboard');
  }

  async getDevOtp(): Promise<string | null> {
    const locator = this.page.locator('text=/DEV OTP: (\\d{6})/');
    if (await locator.isVisible()) {
      const text = await locator.textContent();
      const match = text?.match(/DEV OTP: (\d{6})/);
      return match?.[1] ?? null;
    }
    return null;
  }
}
