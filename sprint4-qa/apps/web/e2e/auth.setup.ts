/**
 * auth.setup.ts
 * Runs once before all test suites.
 * Logs in as User A and User B, saves browser storage state.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '../fixtures/.auth');

const USERS = {
  userA: {
    email: process.env.USER_A_EMAIL || 'usera@studyspace.test',
    password: process.env.USER_A_PASS || 'Password@123',
    statePath: path.join(AUTH_DIR, 'userA.json'),
  },
  userB: {
    email: process.env.USER_B_EMAIL || 'userb@studyspace.test',
    password: process.env.USER_B_PASS || 'Password@123',
    statePath: path.join(AUTH_DIR, 'userB.json'),
  },
};

// Ensure auth directory exists
fs.mkdirSync(AUTH_DIR, { recursive: true });

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  statePath: string
) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  // Wait for successful redirect to dashboard
  await expect(page).toHaveURL(/dashboard|home|feed/, { timeout: 15_000 });
  await page.context().storageState({ path: statePath });
}

setup('Authenticate User A', async ({ page }) => {
  await loginAs(page, USERS.userA.email, USERS.userA.password, USERS.userA.statePath);
});

setup('Authenticate User B', async ({ page }) => {
  await loginAs(page, USERS.userB.email, USERS.userB.password, USERS.userB.statePath);
});
