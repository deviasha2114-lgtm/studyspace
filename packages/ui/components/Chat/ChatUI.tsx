import { useState } from "react";
import { motion } from "framer-motion";

const MEMBERS = [
  { initials: "RK", bg: "#dbeafe", color: "#1d4ed8", online: true },
  { initials: "AS", bg: "#dcfce7", color: "#15803d", online: true },
  { initials: "PM", bg: "#fef3c7", color: "#b45309", online: true },
  { initials: "NJ", bg: "#f3e8ff", color: "#7c3aed", online: false },
];

const INITIAL_MESSAGES = [
  { id: "1", sender: { name: "Rahul K", initials: "RK", bg: "#dbeafe", color: "#1d4ed8" }, content: "Bhai Newton 3rd law ka derivation samajh aa gaya?", timestamp: "10:42 AM" },
  { id: "2", sender: { name: "Anika S", initials: "AS", bg: "#dcfce7", color: "#15803d" }, content: "Haan, NCERT wala better laga.", timestamp: "10:44 AM" },
  { id: "3", sender: { name: "You", initials: "Me", bg: "#f0fdf4", color: "#16a34a" }, content: "Exactly! Magnitude equal, direction opposite.", timestamp: "10:45 AM", isMe: true },
];

export default function ChatUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: { name: "You", initials: "Me", bg: "#f0fdf4", color: "#16a34a" }, content: input.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isMe: true }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[560px] max-w-sm w-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="relative w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">


cat > packages/ui/index.ts << 'EOF'
export { default as ChatUI } from "./components/Chat/ChatUI";
export { default as VideoRoomUI } from "./components/VideoRoom/VideoRoomUI";
export { default as NotificationBell } from "./components/Notifications/NotificationBell";
export { default as NotificationsPage } from "./components/Notifications/NotificationsPage";
