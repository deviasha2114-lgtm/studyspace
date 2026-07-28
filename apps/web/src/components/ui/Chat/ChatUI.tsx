import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  initials: string;
  bg: string;
  color: string;
  online: boolean;
}

interface Message {
  id: string;
  sender: { name: string; initials: string; bg: string; color: string };
  content: string;
  timestamp: string;
  isMe?: boolean;
}

const MEMBERS: Member[] = [
  { initials: "RK", bg: "#dbeafe", color: "#1d4ed8", online: true },
  { initials: "AS", bg: "#dcfce7", color: "#15803d", online: true },
  { initials: "PM", bg: "#fef3c7", color: "#b45309", online: true },
  { initials: "NJ", bg: "#f3e8ff", color: "#7c3aed", online: false },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", sender: { name: "Rahul K", initials: "RK", bg: "#dbeafe", color: "#1d4ed8" }, content: "Bhai Newton 3rd law ka derivation samajh aa gaya?", timestamp: "10:42 AM" },
  { id: "2", sender: { name: "Anika S", initials: "AS", bg: "#dcfce7", color: "#15803d" }, content: "Haan, NCERT wala better laga.", timestamp: "10:44 AM" },
  { id: "3", sender: { name: "You", initials: "Me", bg: "#f0fdf4", color: "#16a34a" }, content: "Exactly! Magnitude equal, direction opposite.", timestamp: "10:45 AM", isMe: true },
  { id: "4", sender: { name: "Priya M", initials: "PM", bg: "#fef3c7", color: "#b45309" }, content: "Video call karein? Board pe draw karte hain 📐", timestamp: "10:46 AM" },
];

export default function ChatUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: { name: "You", initials: "Me", bg: "#f0fdf4", color: "#16a34a" },
        content: input.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[560px] max-w-sm w-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="relative w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
          SP
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Study Room — Physics</p>
          <p className="text-xs text-gray-400">4 members active</p>
        </div>
      </div>

      {/* Online presence */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border-b border-gray-100">
        {MEMBERS.map((m) => (
          <div
            key={m.initials}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${!m.online ? "opacity-40" : ""}`}
            style={{ background: m.bg, color: m.color, boxShadow: m.online ? "0 0 0 2px #22c55e" : undefined }}
          >
            {m.initials}
          </div>
        ))}
        <span className="text-[11px] text-gray-400 ml-1">3 online · 1 offline</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
              style={{ background: msg.sender.bg, color: msg.sender.color }}>
              {msg.sender.initials}
            </div>
            <div className={`max-w-[72%] flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
              <div className={`flex items-baseline gap-1 mb-1 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                <span className="text-xs font-medium text-gray-500">{msg.sender.name}</span>
                <span className="text-[11px] text-gray-300">{msg.timestamp}</span>
              </div>
              <div className={`px-3 py-2 text-sm leading-relaxed ${
                msg.isMe
                  ? "bg-blue-50 text-blue-900 border border-blue-100 rounded-[14px_14px_4px_14px]"
                  : "bg-gray-100 text-gray-800 rounded-[14px_14px_14px_4px]"
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Typing indicator */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-medium">RK</div>
        <div className="bg-gray-100 rounded-xl px-3 py-1.5 flex gap-1 items-center">
          {[0, 0.2, 0.4].map((d, i) => (
            <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: d }} />
          ))}
        </div>
        <span className="text-[11px] text-gray-400">Rahul is typing...</span>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-gray-50">
        <input
          className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-300 text-gray-800"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}
          className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white text-sm transition-colors">
          ➤
        </button>
      </div>
    </div>
  );
}
