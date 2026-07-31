"use client";
export const dynamic = "force-dynamic";


import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { apiClient as axios } from "@/lib/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface NoteAnalytics {
  noteId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
}

interface UserStats {
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
}

function AnalyticsContent() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  if (status === "loading") return null;
  if (status === "loading") return null;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [notes, setNotes] = useState<NoteAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/analytics/dashboard")
      .then(({ data }) => {
        setStats(data.stats);
        setNotes(data.notes);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Notes", value: stats?.totalNotes ?? 0 },
          { label: "Views", value: stats?.totalViews ?? 0 },
          { label: "Likes", value: stats?.totalLikes ?? 0 },
          { label: "Comments", value: stats?.totalComments ?? 0 },
          { label: "Followers", value: stats?.followers ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-400 text-xs uppercase tracking-wide">{s.label}</p>
            <p className="text-white text-2xl font-bold mt-1">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h2 className="text-white font-semibold mb-4">Views by Note</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={notes}>
            <XAxis dataKey="title" tick={{ fill: "#71717a", fontSize: 11 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", color: "#fff" }} />
            <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.noteId} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center justify-between">
            <p className="text-white text-sm font-medium truncate flex-1">{note.title}</p>
            <div className="flex gap-4 text-zinc-400 text-xs shrink-0 ml-4">
              <span>{note.views} views</span>
              <span>{note.likes} likes</span>
              <span>{note.comments} comments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <AnalyticsContent />
    </Suspense>
  );
}
