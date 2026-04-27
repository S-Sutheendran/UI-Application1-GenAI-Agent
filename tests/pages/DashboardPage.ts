import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly addClientBtn: Locator;
  readonly logoutBtn: Locator;
  readonly clientSearch: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addClientBtn = page.getByTestId('add-client-btn');
    this.logoutBtn = page.getByTestId('logout-button');
    this.clientSearch = page.getByTestId('client-search');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await expect(this.page.locator('text=Dashboard')).toBeVisible();
  }

  async navigateTo(section: 'clients' | 'workouts' | 'meals' | 'performance' | 'insights') {
    await this.page.getByRole('link', { name: new RegExp(section, 'i') }).first().click();
    await this.page.waitForURL(`**/${section}`);
  }

  async logout() {
    await this.logoutBtn.click();
    await this.page.waitForURL('**/login');
  }

  async addClient(data: { full_name: string; fitness_goal?: string; fitness_level?: string }) {
    await this.page.goto('/clients');
    await this.addClientBtn.click();
    await this.page.getByTestId('add-client-modal').waitFor();
    await this.page.getByPlaceholder('John Doe').fill(data.full_name);
    if (data.fitness_goal) {
      await this.page.getByPlaceholder(/goal/i).fill(data.fitness_goal);
    }
    if (data.fitness_level) {
      await this.page.locator('select').filter({ hasText: 'Beginner' }).selectOption(data.fitness_level);
    }
    await this.page.getByRole('button', { name: 'Add Client' }).click();
  }
}
