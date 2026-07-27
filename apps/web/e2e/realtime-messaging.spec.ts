/**
 * E2E Test — Real-time messaging between two users
 *
 * Scenario:
 *   1. User A and User B both open the same community chat
 *   2. User A types and sends a message
 *   3. User B receives it in real-time (no page reload)
 *   4. User B replies
 *   5. User A receives the reply in real-time
 *
 * This is the primary Sprint 4 end-to-end scenario.
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { SEL, goToChat, waitForSocketEvent } from '../../helpers/utils';
import path from 'path';

const USER_A_STATE = path.join(__dirname, '../../fixtures/.auth/userA.json');
const USER_B_STATE = path.join(__dirname, '../../fixtures/.auth/userB.json');

const COMMUNITY = 'general';

test('E2E · User A → User B real-time message exchange', async ({ browser }) => {
  // ── Setup two independent browser contexts ───────────────────────────────
  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageA: Page = await ctxA.newPage();
  const pageB: Page = await ctxB.newPage();

  // ── Both users navigate to same chat ────────────────────────────────────
  await Promise.all([
    goToChat(pageA, COMMUNITY),
    goToChat(pageB, COMMUNITY),
  ]);

  // Confirm both pages are loaded
  await expect(pageA.locator(SEL.chatInput)).toBeVisible();
  await expect(pageB.locator(SEL.chatInput)).toBeVisible();

  // ── Step 1: User A sends a message ──────────────────────────────────────
  const msgA = `Hello from A · ${Date.now()}`;

  // Register socket listener BEFORE sending
  const socketEventPromiseB = waitForSocketEvent(pageB, (d) => {
    return d['type'] === 'new_message' && String(d['content']).includes('Hello from A');
  });

  await pageA.fill(SEL.chatInput, msgA);
  await pageA.click(SEL.sendButton);

  // ── Step 2: User B receives via WebSocket (no reload) ───────────────────
  const wsEventB = await socketEventPromiseB;
  expect(wsEventB).toHaveProperty('type', 'new_message');

  // DOM assertion — message appears in User B's chat list
  const msgBLocator = pageB.locator(SEL.messageItem).filter({ hasText: 'Hello from A' });
  await expect(msgBLocator).toBeVisible({ timeout: 6_000 });

  // ── Step 3: User A sees own message (optimistic render or confirmed) ─────
  const msgALocator = pageA.locator(SEL.messageItem).filter({ hasText: 'Hello from A' });
  await expect(msgALocator).toBeVisible({ timeout: 6_000 });

  // ── Step 4: User B replies ───────────────────────────────────────────────
  const msgB = `Reply from B · ${Date.now()}`;

  const socketEventPromiseA = waitForSocketEvent(pageA, (d) => {
    return d['type'] === 'new_message' && String(d['content']).includes('Reply from B');
  });

  await pageB.fill(SEL.chatInput, msgB);
  await pageB.click(SEL.sendButton);

  // ── Step 5: User A receives reply in real-time ───────────────────────────
  const wsEventA = await socketEventPromiseA;
  expect(wsEventA).toHaveProperty('type', 'new_message');

  const replyLocator = pageA.locator(SEL.messageItem).filter({ hasText: 'Reply from B' });
  await expect(replyLocator).toBeVisible({ timeout: 6_000 });

  // ── Step 6: Message ordering is correct ─────────────────────────────────
  const allMessages = pageA.locator(SEL.messageItem);
  const count = await allMessages.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // A's message appears before B's reply
  const texts = await allMessages.allInnerTexts();
  const aIdx = texts.findIndex((t) => t.includes('Hello from A'));
  const bIdx = texts.findIndex((t) => t.includes('Reply from B'));
  expect(aIdx).toBeLessThan(bIdx);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  await ctxA.close();
  await ctxB.close();
});

// ── Bonus: Typing indicator E2E ──────────────────────────────────────────────
test('E2E · Typing indicator cross-user', async ({ browser }) => {
  const ctxA: BrowserContext = await browser.newContext({ storageState: USER_A_STATE });
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageA: Page = await ctxA.newPage();
  const pageB: Page = await ctxB.newPage();

  await Promise.all([goToChat(pageA, COMMUNITY), goToChat(pageB, COMMUNITY)]);

  // A types
  await pageA.focus(SEL.chatInput);
  await pageA.keyboard.type('I am typing right now...', { delay: 50 });

  // B sees typing indicator
  await expect(pageB.locator(SEL.typingIndicator)).toBeVisible({ timeout: 5_000 });

  // A clears
  await pageA.fill(SEL.chatInput, '');

  // Indicator disappears
  await expect(pageB.locator(SEL.typingIndicator)).not.toBeVisible({ timeout: 7_000 });

  await ctxA.close();
  await ctxB.close();
});
