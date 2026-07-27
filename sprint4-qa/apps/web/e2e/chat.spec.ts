/**
 * Sprint 4 — Chat Tests
 * TC-C01  Message send & real-time receive
 * TC-C02  Typing indicator appears & disappears
 * TC-C03  Rate limit (30 msg/min) enforced
 * TC-C04  Older messages pagination (load more)
 */

import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { SEL, sendMessages, waitForSocketEvent, goToChat, getUnreadCount } from '../../helpers/utils';
import path from 'path';

const USER_B_STATE = path.join(__dirname, '../../fixtures/.auth/userB.json');

// ── TC-C01 ─────────────────────────────────────────────────────────────────
test.describe('TC-C01 · Message send / real-time receive', () => {
  let browserB: Browser;
  let ctxB: BrowserContext;
  let pageB: Page;

  test.beforeEach(async ({ browser }) => {
    browserB = browser;
    ctxB = await browser.newContext({ storageState: USER_B_STATE });
    pageB = await ctxB.newPage();
  });

  test.afterEach(async () => {
    await ctxB.close();
  });

  test('User A sends a message — User B receives it without reload', async ({ page }) => {
    // Both users in same chat
    await goToChat(page);
    await goToChat(pageB);

    const uniqueMsg = `hello-${Date.now()}`;

    // Listen for WS event on User B side BEFORE sending
    const socketPromise = waitForSocketEvent(pageB, (d) => d['type'] === 'new_message');

    await page.fill(SEL.chatInput, uniqueMsg);
    await page.click(SEL.sendButton);

    // 1️⃣ Socket event arrives
    const wsEvent = await socketPromise;
    expect((wsEvent as { content?: string })['content']).toContain(uniqueMsg);

    // 2️⃣ Message visible in User B's DOM
    await expect(pageB.locator(SEL.messageItem).filter({ hasText: uniqueMsg })).toBeVisible();

    // 3️⃣ Message also visible in User A's own list (optimistic or confirmed)
    await expect(page.locator(SEL.messageItem).filter({ hasText: uniqueMsg })).toBeVisible();
  });
});

// ── TC-C02 ─────────────────────────────────────────────────────────────────
test.describe('TC-C02 · Typing indicator', () => {
  let ctxB: BrowserContext;
  let pageB: Page;

  test.beforeEach(async ({ browser }) => {
    ctxB = await browser.newContext({ storageState: USER_B_STATE });
    pageB = await ctxB.newPage();
  });

  test.afterEach(async () => ctxB.close());

  test('Typing indicator shown to other user while typing, hidden after stop', async ({ page }) => {
    await goToChat(page);
    await goToChat(pageB);

    // User A starts typing
    await page.focus(SEL.chatInput);
    await page.keyboard.type('I am typing…', { delay: 60 });

    // User B should see indicator
    await expect(pageB.locator(SEL.typingIndicator)).toBeVisible({ timeout: 5_000 });

    // User A clears input (simulates stopping)
    await page.fill(SEL.chatInput, '');
    await page.keyboard.press('Backspace');

    // Indicator should disappear within 5 s (server TTL)
    await expect(pageB.locator(SEL.typingIndicator)).not.toBeVisible({ timeout: 7_000 });
  });
});

// ── TC-C03 ─────────────────────────────────────────────────────────────────
test.describe('TC-C03 · Rate limit (30 messages / minute)', () => {
  test('31st message within a minute is rejected with rate-limit error', async ({ page }) => {
    await goToChat(page);

    // Send 30 messages — all should succeed
    await sendMessages(page, 30, 'rate-test');

    // The 31st should trigger an error UI
    await page.fill(SEL.chatInput, 'message 31 — should be blocked');
    await page.click(SEL.sendButton);

    const errorLocator = page.locator('[data-testid="rate-limit-error"], [role="alert"]').filter({
      hasText: /rate limit|too many|slow down/i,
    });

    await expect(errorLocator).toBeVisible({ timeout: 5_000 });
  });
});

// ── TC-C04 ─────────────────────────────────────────────────────────────────
test.describe('TC-C04 · Pagination (load older messages)', () => {
  test('Load-more button fetches previous page of messages', async ({ page }) => {
    await goToChat(page);

    // Count current messages
    const initialCount = await page.locator(SEL.messageItem).count();

    const loadMore = page.locator(SEL.loadMoreBtn);

    // Only run if there are enough historical messages to paginate
    if (!(await loadMore.isVisible())) {
      test.skip();
      return;
    }

    await loadMore.click();

    // After loading, more messages should be present
    await expect(page.locator(SEL.messageItem)).toHaveCount(
      (n: number) => n > initialCount,
      { timeout: 6_000 } as { timeout: number }
    );

    // Scroll position should be preserved (user stays at same visual position)
    const scrollTop = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="message-list"]');
      return el ? el.scrollTop : -1;
    });
    expect(scrollTop).toBeGreaterThan(0);
  });
});
