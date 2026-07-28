import { useState } from "react";
import { motion } from "framer-motion";

interface Participant {
  initials: string;
  name: string;
  bg: string;
  color: string;
  muted: boolean;
  speaking?: boolean;
  isMe?: boolean;
}

const PARTICIPANTS: Participant[] = [
  { initials: "RK", name: "Rahul K", bg: "#1d3a6e", color: "#93c5fd", muted: false, speaking: true, isMe: true },
  { initials: "AS", name: "Anika S", bg: "#14532d", color: "#86efac", muted: true },
  { initials: "PM", name: "Priya M", bg: "#451a03", color: "#fcd34d", muted: false },
  { initials: "NJ", name: "Neeraj J", bg: "#2e1065", color: "#c4b5fd", muted: true },
  { initials: "SK", name: "Sakshi K", bg: "#1c1917", color: "#d6d3d1", muted: false },
  { initials: "VR", name: "Vivek R", bg: "#0c4a6e", color: "#7dd3fc", muted: false },
];

export default function VideoRoomUI() {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  return (
    <div className="bg-gray-950 rounded-2xl overflow-hidden p-4 flex flex-col gap-3 w-full max-w-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium">Physics Study Room</p>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
            Live · 6 participants
          </p>
        </div>
        <span className="text-gray-400 text-xs">32:14</span>
      </div>

      {/* Participant grid */}
      <div className="grid grid-cols-3 gap-2">
        {PARTICIPANTS.map((p) => (
          <div
            key={p.initials}
            className="relative rounded-xl overflow-hidden aspect-video flex items-center justify-center"
            style={{
              background: p.bg,
              border: p.speaking ? "1.5px solid #22c55e" : "1.5px solid #333",
              boxShadow: p.speaking ? "0 0 0 2px rgba(34,197,94,0.25)" : undefined,
            }}
          >
            <span className="text-lg font-medium" style={{ color: p.color }}>{p.initials}</span>
            {p.isMe && (
              <span className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">You</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center">
              <span className="text-white text-[10px] font-medium flex-1">{p.name}</span>
              <span className={`text-[12px] ${p.muted ? "text-red-400" : "text-white"}`}>
                {p.muted ? "🔇" : "🎙️"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-center gap-5">
        {[
          { label: "Mic", icon: micOn ? "🎙️" : "🔇", active: micOn, danger: !micOn, action: () => setMicOn(!micOn) },
          { label: "Camera", icon: camOn ? "📹" : "📷", active: camOn, action: () => setCamOn(!camOn) },
          { label: "Share", icon: "🖥️", active: sharing, action: () => setSharing(!sharing) },
          { label: "Chat", icon: "💬", active: false, action: () => {} },
          { label: "People", icon: "👥", active: false, action: () => {} },
        ].map((ctrl) => (
          <div key={ctrl.label} className="flex flex-col items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={ctrl.action}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border transition-colors ${
                ctrl.danger
                  ? "bg-red-950 border-red-700"
                  : ctrl.active
                  ? "bg-gray-700 border-gray-500"
                  : "bg-gray-800 border-gray-600 hover:bg-gray-700"
              }`}
            >
              {ctrl.icon}
            </motion.button>
            <span className={`text-[10px] ${ctrl.danger ? "text-red-400" : "text-gray-400"}`}>{ctrl.label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg bg-red-900 border border-red-700 hover:bg-red-800 transition-colors"
          >
            📵
          </motion.button>
          <span className="text-[10px] text-red-400">Leave</span>
        </div>
      </div>
    </div>
  );
}
