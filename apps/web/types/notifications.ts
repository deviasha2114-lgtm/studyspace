// types/notifications.ts
// Shared types for the Notifications system (Sprint 7)

export type NotificationType =
  | "FOLLOW"
  | "UNFOLLOW"
  | "NOTE_LIKE"
  | "NOTE_COMMENT"
  | "COMMUNITY_JOIN"
  | "COMMUNITY_INVITE"
  | "MENTION"
  | "SYSTEM";

export interface NotificationActor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string; // ISO string
  entityId?: string | null;
  entityType?: string | null;
  actor?: NotificationActor | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface MarkReadPayload {
  ids?: string[];   // omit to mark ALL as read
}
