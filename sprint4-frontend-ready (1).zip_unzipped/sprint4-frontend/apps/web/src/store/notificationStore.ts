import { create } from "zustand";
import { Notification } from "@studyspace/ui/components/Notifications/NotificationsPage";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    // Fire-and-forget API call
    fetch(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(console.error);
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    fetch("/api/notifications/read-all", { method: "PATCH" }).catch(console.error);
  },

  deleteNotification: (id) => {
    const { notifications } = get();
    const target = notifications.find((n) => n.id === id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: target && !target.isRead
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));
    fetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(console.error);
  },

  fetchNotifications: async (userId) => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data: Notification[] = await res.json();
      get().setNotifications(
        data.map((n) => ({ ...n, createdAt: new Date(n.createdAt) }))
      );
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  },
}));
