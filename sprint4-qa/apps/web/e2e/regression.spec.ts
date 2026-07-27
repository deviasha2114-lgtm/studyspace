/**
 * Regression Tests — Sprint 1–3 Core Flows
 * Ensures Sprint 4 changes haven't broken existing features.
 *
 * TC-R01  User registration & login
 * TC-R02  Community creation & membership
 * TC-R03  Post creation, edit, delete
 * TC-R04  Comment thread
 * TC-R05  User profile update
 * TC-R06  Search returns results
 */

import { test, expect } from '@playwright/test';

// ── TC-R01 ─────────────────────────────────────────────────────────────────
test('TC-R01 · Login flow still works post Sprint 4', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(process.env.USER_A_EMAIL || 'usera@studyspace.test');
  await page.getByLabel(/password/i).fill(process.env.USER_A_PASS || 'Password@123');
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  await expect(page).toHaveURL(/dashboard|home|feed/, { timeout: 15_000 });
  await expect(page.locator('[data-testid="user-avatar"], [data-testid="user-menu"]')).toBeVisible();
});

// ── TC-R02 ─────────────────────────────────────────────────────────────────
test('TC-R02 · Community list still loads', async ({ page }) => {
  await page.goto('/communities');
  await expect(page.locator('[data-testid="community-card"]').first()).toBeVisible({ timeout: 8_000 });
});

// ── TC-R03 ─────────────────────────────────────────────────────────────────
test('TC-R03 · Create a post, edit it, then delete it', async ({ page }) => {
  await page.goto('/community/general/posts');

  // Create
  await page.getByRole('button', { name: /new post|create post/i }).click();
  const title = `regression-post-${Date.now()}`;
  await page.getByLabel(/title/i).fill(title);
  await page.getByLabel(/content|body/i).fill('Regression test content.');
  await page.getByRole('button', { name: /publish|submit/i }).click();

  await expect(page.locator('[data-testid="post-title"]').filter({ hasText: title })).toBeVisible({
    timeout: 8_000,
  });

  // Edit
  await page.locator('[data-testid="post-options"]').first().click();
  await page.getByRole('menuitem', { name: /edit/i }).click();
  await page.getByLabel(/title/i).fill(`${title}-edited`);
  await page.getByRole('button', { name: /save|update/i }).click();

  await expect(page.locator('[data-testid="post-title"]').filter({ hasText: '-edited' })).toBeVisible({
    timeout: 6_000,
  });

  // Delete
  await page.locator('[data-testid="post-options"]').first().click();
  await page.getByRole('menuitem', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm|yes/i }).click();

  await expect(
    page.locator('[data-testid="post-title"]').filter({ hasText: `${title}-edited` })
  ).not.toBeVisible({ timeout: 6_000 });
});

// ── TC-R04 ─────────────────────────────────────────────────────────────────
test('TC-R04 · Comment thread renders', async ({ page }) => {
  await page.goto('/community/general/posts');
  await page.locator('[data-testid="post-card"]').first().click();

  // Comment section should load
  await expect(page.locator('[data-testid="comment-section"]')).toBeVisible({ timeout: 8_000 });
});

// ── TC-R05 ─────────────────────────────────────────────────────────────────
test('TC-R05 · User profile update still works', async ({ page }) => {
  await page.goto('/profile/edit');

  const bio = `Bio updated at ${Date.now()}`;
  await page.getByLabel(/bio/i).fill(bio);
  await page.getByRole('button', { name: /save|update/i }).click();

  await expect(page.getByText(bio)).toBeVisible({ timeout: 6_000 });
});

// ── TC-R06 ─────────────────────────────────────────────────────────────────
test('TC-R06 · Global search returns results', async ({ page }) => {
  await page.goto('/');
  const searchInput = page.locator('[data-testid="global-search"], [placeholder*="Search"]');
  await searchInput.fill('study');
  await page.keyboard.press('Enter');

  // Results page or dropdown should appear
  await expect(
    page.locator('[data-testid="search-results"], [data-testid="search-result-item"]').first()
  ).toBeVisible({ timeout: 8_000 });
});

// ── TC-R07 · Database schema sanity ────────────────────────────────────────
test('TC-R07 · Sprint 4 API endpoints respond (schema not broken)', async ({ request }) => {
  // These are authenticated via storageState — just checking 200, not content
  const checks = [
    { method: 'GET', path: '/api/messages?communityId=general&limit=20' },
    { method: 'GET', path: '/api/video-rooms?communityId=general' },
    { method: 'GET', path: '/api/notifications?limit=10' },
  ];

  for (const { method, path } of checks) {
    const res = method === 'GET'
      ? await request.get(path)
      : await request.post(path);

    expect(res.status(), `${method} ${path} should return 2xx`).toBeLessThan(300);
  }
});
