"use client";

export interface Notification {
  id: string;
  type: "message" | "mention" | "room_invite" | "community";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  href?: string;
}

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

const iconMap: Record<Notification["type"], string> = {
  message: "💬",
  mention: "@",
  room_invite: "📹",
  community: "🏫",
};

export function NotificationsPage({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationsPageProps) {
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-4">🔔</div>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-2xl transition-colors ${
                n.isRead ? "bg-gray-900" : "bg-indigo-950/60 border border-indigo-800/40"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-base shrink-0">
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    n.isRead ? "text-gray-300" : "text-white"
                  }`}
                >
                  {n.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {new Date(n.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-900/40 transition-colors"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => onDelete(n.id)}
                  className="text-[10px] text-gray-600 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
