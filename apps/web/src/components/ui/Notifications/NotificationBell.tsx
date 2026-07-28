import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notif {
  id: string;
  type: "chat" | "video" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notif[] = [
  { id: "1", type: "chat", title: "Rahul mentioned you", body: 'Physics Room: "@You bhai derivation dekh"', time: "2 min ago", read: false },
  { id: "2", type: "video", title: "Video call started", body: "Priya started a call in Chemistry Room", time: "15 min ago", read: false },
  { id: "3", type: "system", title: "Exam reminder", body: "Physics mock test tomorrow 9 AM", time: "1 hr ago", read: false },
  { id: "4", type: "chat", title: "Anika sent a file", body: "Newton_Laws_Notes.pdf shared in Physics Room", time: "3 hr ago", read: true },
];

const typeIcon: Record<string, string> = { chat: "💬", video: "📹", system: "🔔" };
const typeBg: Record<string, string> = {
  chat: "bg-blue-100 text-blue-700",
  video: "bg-green-100 text-green-700",
  system: "bg-amber-100 text-amber-700",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(true);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFICATIONS);
  const unread = notifs.filter((n) => !n.read).length;

  const markAll = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-2 border-white font-medium">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-900">Notifications</span>
              <button onClick={markAll} className="text-xs text-blue-500 hover:text-blue-700">Mark all as read</button>
            </div>

            {notifs.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/50" : ""}`}
                onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${typeBg[n.type]}`}>
                  {typeIcon[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{n.time}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
