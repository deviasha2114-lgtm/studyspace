import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_NOTIFS = [
  { id: "1", type: "chat", title: "Rahul mentioned you in Physics Room", desc: "@You bhai derivation dekh, samajh aa jayega", time: "2 min ago", read: false },
  { id: "2", type: "video", title: "Video call started — Chemistry Room", desc: "Priya M started a call. 3 participants joined.", time: "15 min ago", read: false },
  { id: "3", type: "system", title: "Exam reminder — Physics Mock Test", desc: "Scheduled for tomorrow at 9:00 AM.", time: "1 hr ago", read: false },
  { id: "4", type: "chat", title: "Anika shared a file", desc: "Newton_Laws_Notes.pdf in Physics Room", time: "3 hr ago", read: true },
  { id: "5", type: "video", title: "Video call ended — Physics Room", desc: "Call lasted 45 minutes. 6 participants.", time: "Yesterday", read: true },
  { id: "6", type: "system", title: "App updated to v2.4", desc: "New features: screen share, reactions, and more.", time: "2 days ago", read: true },
];

const typeIcon = { chat: "💬", video: "📹", system: "⚙️" };
const typeBg = { chat: "bg-blue-100 text-blue-700", video: "bg-green-100 text-green-700", system: "bg-gray-100 text-gray-600" };
const TABS = ["all", "chat", "video", "system"];

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [notifs, setNotifs] = useState(ALL_NOTIFS);
  const filtered = tab === "all" ? notifs : notifs.filter((n) => n.type === tab);

  return (
    <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-base font-medium text-gray-900">All notifications</h1>
      </div>
      <div className="flex border-b border-gray-100 bg-gray-50 px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors capitalize ${tab === t ? "border-blue-500 text-blue-600 font-medium" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-16">
            <span className="text-4xl">🔕</span>
            <p className="text-sm font-medium text-gray-500">No notifications here</p>
            <p className="text-xs text-gray-300">You're all caught up!</p>
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {filtered.map((n) => (
              <div key={n.id} onClick={() => setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                className={`flex gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-blue-50/40" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${typeBg[n.type as keyof typeof typeBg]}`}>{typeIcon[n.type as keyof typeof typeIcon]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
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
