import { Page, expect } from '@playwright/test';

// ─── Selectors (centralised — update here if UI changes) ───────────────────
export const SEL = {
  // Chat
  chatInput:        '[data-testid="chat-input"]',
  sendButton:       '[data-testid="send-message"]',
  messageList:      '[data-testid="message-list"]',
  messageItem:      '[data-testid="message-item"]',
  typingIndicator:  '[data-testid="typing-indicator"]',
  loadMoreBtn:      '[data-testid="load-more-messages"]',

  // Video Room
  createRoomBtn:    '[data-testid="create-video-room"]',
  joinRoomBtn:      '[data-testid="join-video-room"]',
  muteBtn:          '[data-testid="toggle-mute"]',
  cameraBtn:        '[data-testid="toggle-camera"]',
  screenShareBtn:   '[data-testid="toggle-screenshare"]',
  leaveRoomBtn:     '[data-testid="leave-room"]',
  roomTile:         '[data-testid="video-room-tile"]',
  participantList:  '[data-testid="participant-list"]',

  // Notifications
  notifBell:        '[data-testid="notification-bell"]',
  unreadBadge:      '[data-testid="unread-badge"]',
  notifList:        '[data-testid="notification-list"]',
  notifItem:        '[data-testid="notification-item"]',
  markReadBtn:      '[data-testid="mark-read"]',
  markAllReadBtn:   '[data-testid="mark-all-read"]',

  // Auth/Nav
  navCommunity:     '[data-testid="nav-community"]',
  navVideo:         '[data-testid="nav-video"]',
} as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Wait for a WebSocket message matching a predicate.
 * Returns the parsed JSON payload.
 */
export async function waitForSocketEvent(
  page: Page,
  predicate: (data: Record<string, unknown>) => boolean,
  timeout = 8_000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('waitForSocketEvent timed out')), timeout);

    page.on('websocket', (ws) => {
      ws.on('framereceived', (event) => {
        try {
          const data = JSON.parse(event.payload as string);
          if (predicate(data)) {
            clearTimeout(timer);
            resolve(data);
          }
        } catch {
          /* non-JSON frame — ignore */
        }
      });
    });
  });
}

/**
 * Send `count` messages rapidly from the current page.
 */
export async function sendMessages(page: Page, count: number, prefix = 'msg') {
  for (let i = 1; i <= count; i++) {
    await page.fill(SEL.chatInput, `${prefix} ${i}`);
    await page.click(SEL.sendButton);
    // Small gap to avoid browser-level throttle on rapid clicks
    await page.waitForTimeout(50);
  }
}

/**
 * Navigate to a community chat room by name.
 */
export async function goToChat(page: Page, communitySlug = 'general') {
  await page.goto(`/community/${communitySlug}/chat`);
  await page.waitForSelector(SEL.chatInput);
}

/**
 * Navigate to the video rooms page.
 */
export async function goToVideoRooms(page: Page, communitySlug = 'general') {
  await page.goto(`/community/${communitySlug}/video`);
}

/**
 * Get the current integer value of the unread notification badge.
 * Returns 0 if badge is absent.
 */
export async function getUnreadCount(page: Page): Promise<number> {
  const badge = page.locator(SEL.unreadBadge);
  if (!(await badge.isVisible())) return 0;
  const text = await badge.innerText();
  return parseInt(text.trim(), 10) || 0;
}
