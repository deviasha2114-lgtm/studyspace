/**
 * Sprint 4 — Auth / Security Tests
 * TC-A01  Unauthenticated WebSocket connection is rejected
 * TC-A02  Non-member cannot access a private video room
 */

import { test, expect } from '@playwright/test';

// These tests run WITHOUT any storageState (no authenticated user)

// ── TC-A01 ─────────────────────────────────────────────────────────────────
test('TC-A01 · Unauthenticated WebSocket connection is rejected', async ({ page }) => {
  const socketErrors: string[] = [];
  const closedCodes: number[] = [];

  // Intercept WebSocket lifecycle
  page.on('websocket', (ws) => {
    ws.on('socketerror', (err) => socketErrors.push(err));
    ws.on('close', (ws) => {
      // Access close code via evaluate if needed
    });
  });

  // Try connecting to the chat without auth cookies
  const response = await page.request.get('/api/socket', {
    headers: { Upgrade: 'websocket' },
  });

  // Expect 401 or 403 at the HTTP upgrade level
  expect([401, 403]).toContain(response.status());

  // Navigate to chat page unauthenticated
  await page.goto('/community/general/chat');

  // Should be redirected to login
  await expect(page).toHaveURL(/login|signin/, { timeout: 8_000 });
});

// ── TC-A02 ─────────────────────────────────────────────────────────────────
test('TC-A02 · Non-member blocked from private video room', async ({ page, request }) => {
  // Attempt to access a known private room URL without auth
  await page.goto('/community/private-community/video/some-room-id');

  // Must NOT load the video room UI
  await expect(page.locator('[data-testid="video-room-container"]')).not.toBeVisible();

  // Must redirect to login or show 403
  const isLoginPage = await page.locator('[data-testid="login-form"]').isVisible();
  const is403 = page.url().includes('403') || page.url().includes('unauthorized');
  const hasErrorMessage = await page
    .getByText(/not authorized|access denied|members only/i)
    .isVisible();

  expect(isLoginPage || is403 || hasErrorMessage).toBeTruthy();
});

// ── TC-A03 · API endpoint requires auth ─────────────────────────────────────
test('TC-A03 · Unauthenticated API calls return 401', async ({ request }) => {
  const endpoints = [
    '/api/messages',
    '/api/video-rooms',
    '/api/notifications',
  ];

  for (const endpoint of endpoints) {
    const res = await request.get(endpoint);
    expect(res.status(), `Expected 401 for ${endpoint}`).toBe(401);
  }
});
