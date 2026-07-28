import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "all" | "chat" | "video" | "system";

interface Notif {
  id: string;
  type: "chat" | "video" | "system";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const ALL_NOTIFS: Notif[] = [
  { id: "1", type: "chat", title: "Rahul mentioned you in Physics Room", desc: '"@You bhai derivation dekh, samajh aa jayega"', time: "2 min ago", read: false },
  { id: "2", type: "video", title: "Video call started — Chemistry Room", desc: "Priya M started a call. 3 participants joined.", time: "15 min ago", read: false },
  { id: "3", type: "system", title: "Exam reminder — Physics Mock Test", desc: "Scheduled for tomorrow at 9:00 AM. Prepare accordingly.", time: "1 hr ago", read: false },
  { id: "4", type: "chat", title: "Anika shared a file", desc: "Newton_Laws_Notes.pdf in Physics Room", time: "3 hr ago", read: true },
  { id: "5", type: "video", title: "Video call ended — Physics Room", desc: "Call lasted 45 minutes. 6 participants.", time: "Yesterday", read: true },
  { id: "6", type: "system", title: "App updated to v2.4", desc: "New features: screen share, reactions, and more.", time: "2 days ago", read: true },
];

const typeIcon: Record<string, string> = { chat: "💬", video: "📹", system: "⚙️" };
const typeBg: Record<string, string> = {
  chat: "bg-blue-100 text-blue-700",
  video: "bg-green-100 text-green-700",
  system: "bg-gray-100 text-gray-600",
};

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "chat", label: "Chat" },
  { key: "video", label: "Video" },
  { key: "system", label: "System" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [notifs, setNotifs] = useState<Notif[]>(ALL_NOTIFS);

  const filtered = tab === "all" ? notifs : notifs.filter((n) => n.type === tab);

  return (
    <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-base font-medium text-gray-900">All notifications</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50 px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-500 text-blue-600 font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-16 text-center"
          >
            <span className="text-4xl">🔕</span>
            <p className="text-sm font-medium text-gray-500">No notifications here</p>
            <p className="text-xs text-gray-300">You're all caught up!</p>
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                className={`flex gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${typeBg[n.type]}`}>
                  {typeIcon[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{n.desc}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{n.time}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
