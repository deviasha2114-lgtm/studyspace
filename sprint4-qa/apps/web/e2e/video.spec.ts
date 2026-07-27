/**
 * Sprint 4 — Video Room Tests
 * TC-V01  Create a video room
 * TC-V02  Join an existing room
 * TC-V03  Mute / unmute audio
 * TC-V04  Camera toggle (on / off)
 * TC-V05  Screen share starts & stops
 * TC-V06  Leave room redirects correctly
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { SEL, goToVideoRooms } from '../../helpers/utils';
import path from 'path';

const USER_B_STATE = path.join(__dirname, '../../fixtures/.auth/userB.json');

// ── TC-V01 ─────────────────────────────────────────────────────────────────
test('TC-V01 · Create a video room', async ({ page }) => {
  await goToVideoRooms(page);

  const roomName = `test-room-${Date.now()}`;
  await page.click(SEL.createRoomBtn);

  // Fill room name in modal / form
  await page.getByLabel(/room name/i).fill(roomName);
  await page.getByRole('button', { name: /create|start/i }).click();

  // Should land inside the room
  await expect(page).toHaveURL(/\/video\/.+/, { timeout: 10_000 });
  await expect(page.locator('[data-testid="video-room-container"]')).toBeVisible();
});

// ── TC-V02 ─────────────────────────────────────────────────────────────────
test('TC-V02 · Join an existing room', async ({ page, browser }) => {
  // User A creates a room
  await goToVideoRooms(page);
  const roomName = `join-test-${Date.now()}`;
  await page.click(SEL.createRoomBtn);
  await page.getByLabel(/room name/i).fill(roomName);
  await page.getByRole('button', { name: /create|start/i }).click();
  await page.waitForURL(/\/video\/.+/);
  const roomUrl = page.url();

  // User B joins the same room
  const ctxB: BrowserContext = await browser.newContext({ storageState: USER_B_STATE });
  const pageB: Page = await ctxB.newPage();
  await pageB.goto(roomUrl);

  // Both users visible in participant list
  await expect(page.locator(SEL.participantList).locator('[data-testid="participant"]')).toHaveCount(2, {
    timeout: 12_000,
  });

  await ctxB.close();
});

// ── TC-V03 ─────────────────────────────────────────────────────────────────
test('TC-V03 · Mute / unmute audio', async ({ page }) => {
  await goToVideoRooms(page);
  await page.click(SEL.createRoomBtn);
  await page.getByLabel(/room name/i).fill(`mute-test-${Date.now()}`);
  await page.getByRole('button', { name: /create|start/i }).click();
  await page.waitForURL(/\/video\/.+/);

  const muteBtn = page.locator(SEL.muteBtn);

  // Initial state: unmuted
  await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');

  // Mute
  await muteBtn.click();
  await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-testid="muted-icon"]')).toBeVisible();

  // Unmute
  await muteBtn.click();
  await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-testid="muted-icon"]')).not.toBeVisible();
});

// ── TC-V04 ─────────────────────────────────────────────────────────────────
test('TC-V04 · Camera toggle', async ({ page }) => {
  await goToVideoRooms(page);
  await page.click(SEL.createRoomBtn);
  await page.getByLabel(/room name/i).fill(`cam-test-${Date.now()}`);
  await page.getByRole('button', { name: /create|start/i }).click();
  await page.waitForURL(/\/video\/.+/);

  const cameraBtn = page.locator(SEL.cameraBtn);

  // Turn camera off
  await cameraBtn.click();
  await expect(cameraBtn).toHaveAttribute('aria-pressed', 'true'); // pressed = cam off
  await expect(page.locator('[data-testid="camera-off-icon"]')).toBeVisible();

  // Turn camera back on
  await cameraBtn.click();
  await expect(cameraBtn).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-testid="camera-off-icon"]')).not.toBeVisible();
});

// ── TC-V05 ─────────────────────────────────────────────────────────────────
test('TC-V05 · Screen share start / stop', async ({ page, context }) => {
  // Grant permissions so screen share dialog doesn't block
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await goToVideoRooms(page);
  await page.click(SEL.createRoomBtn);
  await page.getByLabel(/room name/i).fill(`screen-test-${Date.now()}`);
  await page.getByRole('button', { name: /create|start/i }).click();
  await page.waitForURL(/\/video\/.+/);

  const ssBtn = page.locator(SEL.screenShareBtn);

  await ssBtn.click();

  // Button should toggle to active state
  await expect(ssBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 6_000 });

  // Stop sharing
  await ssBtn.click();
  await expect(ssBtn).toHaveAttribute('aria-pressed', 'false', { timeout: 6_000 });
});

// ── TC-V06 ─────────────────────────────────────────────────────────────────
test('TC-V06 · Leave room redirects to video list', async ({ page }) => {
  await goToVideoRooms(page);
  await page.click(SEL.createRoomBtn);
  await page.getByLabel(/room name/i).fill(`leave-test-${Date.now()}`);
  await page.getByRole('button', { name: /create|start/i }).click();
  await page.waitForURL(/\/video\/.+/);

  await page.click(SEL.leaveRoomBtn);

  // Should redirect away from room URL
  await expect(page).not.toHaveURL(/\/video\/.{5,}/, { timeout: 8_000 });
  // Room tile list should be visible again
  await expect(page.locator(SEL.createRoomBtn)).toBeVisible();
});
