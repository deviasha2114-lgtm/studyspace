/**
 * Sprint 4 — Notifications Tests
 * TC-N01  Notification received on new chat message
 * TC-N02  Mark single notification as read
 * TC-N03  Mark all notifications as read
 * TC-N04  Unread badge count increments & clears
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { SEL, goToChat, getUnreadCount } from '../../helpers/utils';
import path from 'path';

const USER_A_STATE = path.join(__dirname, '../../fixtures/.auth/userA.json');
const USER_B_STATE = path.join(__dirname, '../../fixtures/.auth/userB.json');

// ── TC-N01 ─────────────────────────────────────────────────────────────────
test('TC-N01 · Notification received when someone sends a message', async ({ browser }) => {
  // User A is on the Dashboard (NOT in the chat)
  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const pageA: Page = await ctxA.newPage();
  await pageA.goto('/dashboard');

  // User B sends a message
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageB: Page = await ctxB.newPage();
  await goToChat(pageB);
  await pageB.fill(SEL.chatInput, `notif-trigger-${Date.now()}`);
  await pageB.click(SEL.sendButton);

  // User A should see a new notification
  await expect(pageA.locator(SEL.unreadBadge)).toBeVisible({ timeout: 8_000 });

  await ctxA.close();
  await ctxB.close();
});

// ── TC-N02 ─────────────────────────────────────────────────────────────────
test('TC-N02 · Mark single notification as read', async ({ browser }) => {
  // Ensure User A has at least one unread notification (sent by User B)
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageB: Page = await ctxB.newPage();
  await goToChat(pageB);
  await pageB.fill(SEL.chatInput, `single-read-${Date.now()}`);
  await pageB.click(SEL.sendButton);
  await ctxB.close();

  // User A opens notifications
  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const pageA: Page = await ctxA.newPage();
  await pageA.goto('/dashboard');

  const bellBtn = pageA.locator(SEL.notifBell);
  await expect(bellBtn).toBeVisible();
  await bellBtn.click();

  const firstNotif = pageA.locator(SEL.notifItem).first();
  await expect(firstNotif).toBeVisible();

  // Mark first notification as read
  await firstNotif.locator(SEL.markReadBtn).click();

  // That notification should no longer have unread styling
  await expect(firstNotif).not.toHaveClass(/unread/, { timeout: 5_000 });

  await ctxA.close();
});

// ── TC-N03 ─────────────────────────────────────────────────────────────────
test('TC-N03 · Mark all notifications as read', async ({ browser }) => {
  // User B sends 3 messages to generate 3 notifications for User A
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageB: Page = await ctxB.newPage();
  await goToChat(pageB);
  for (let i = 0; i < 3; i++) {
    await pageB.fill(SEL.chatInput, `bulk-notif-${i}-${Date.now()}`);
    await pageB.click(SEL.sendButton);
    await pageB.waitForTimeout(300);
  }
  await ctxB.close();

  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const pageA: Page = await ctxA.newPage();
  await pageA.goto('/dashboard');

  // Open notification panel
  await pageA.locator(SEL.notifBell).click();
  await expect(pageA.locator(SEL.notifList)).toBeVisible();

  // Click "mark all read"
  await pageA.locator(SEL.markAllReadBtn).click();

  // All items should lose unread class
  const unreadItems = pageA.locator(`${SEL.notifItem}.unread`);
  await expect(unreadItems).toHaveCount(0, { timeout: 5_000 });

  // Badge should disappear
  await expect(pageA.locator(SEL.unreadBadge)).not.toBeVisible({ timeout: 4_000 });

  await ctxA.close();
});

// ── TC-N04 ─────────────────────────────────────────────────────────────────
test('TC-N04 · Unread badge count increments and clears', async ({ browser }) => {
  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const pageA: Page = await ctxA.newPage();
  await pageA.goto('/dashboard');

  const initialCount = await getUnreadCount(pageA);

  // User B sends 2 messages
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageB: Page = await ctxB.newPage();
  await goToChat(pageB);
  for (let i = 0; i < 2; i++) {
    await pageB.fill(SEL.chatInput, `badge-test-${i}-${Date.now()}`);
    await pageB.click(SEL.sendButton);
    await pageB.waitForTimeout(400);
  }
  await ctxB.close();

  // Badge should increment by 2
  await expect(async () => {
    const count = await getUnreadCount(pageA);
    expect(count).toBe(initialCount + 2);
  }).toPass({ timeout: 10_000 });

  // Mark all read → badge clears
  await pageA.locator(SEL.notifBell).click();
  await pageA.locator(SEL.markAllReadBtn).click();
  await expect(pageA.locator(SEL.unreadBadge)).not.toBeVisible({ timeout: 5_000 });

  await ctxA.close();
});
