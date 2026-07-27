"use client";

import Link from "next/link";
import { NotificationBell } from "@studyspace/ui/components/Notifications/NotificationBell";
import { useNotificationStore } from "@/store/notificationStore";

export function Navbar() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <nav className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="font-bold text-white text-lg tracking-tight">
        Study<span className="text-indigo-400">Space</span>
      </Link>

      {/* Nav links */}
      <div className="flex gap-1 ml-4">
        <Link
          href="/communities"
          className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Communities
        </Link>
        <Link
          href="/rooms"
          className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Rooms
        </Link>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell unreadCount={unreadCount} />
        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white cursor-pointer">
          U
        </div>
      </div>
    </nav>
  );
}
