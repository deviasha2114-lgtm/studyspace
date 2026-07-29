"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

interface UserAnalytics {
    user: { id: string; name: string; avatarUrl: string | null };
    stats: { totalNotes: number; totalViews: number; followers: number; following: number; communities: number };
    notesPerMonth: { month: string; count: number }[];
}
interface NoteAnalytics {
    note: { id: string; title: string };
    viewsLast7Days: { date: string; count: number }[];
    totalViews: number;
}

function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatMonth(str: string): string {
    if (str.includes("-")) { const [, m] = str.split("-"); return MONTHS_SHORT[parseInt(m, 10) - 1] ?? str; }
    return str;
}
function formatDay(str: string): string {
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function StatCard({ label, value, icon, accent = "indigo", loading }: { label: string; value: number | string; icon: React.ReactNode; accent?: string; loading?: boolean }) {
    const accentMap: Record<string, string> = { indigo: "bg-indigo-600/20 text-indigo-400", violet: "bg-violet-600/20 text-violet-400", sky: "bg-sky-600/20 text-sky-400", emerald: "bg-emerald-600/20 text-emerald-400", amber: "bg-amber-600/20 text-amber-400" };
    return (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentMap[accent] ?? accentMap.indigo}`}>{icon}</div>
            </div>
            {loading ? <div className="h-8 bg-zinc-800 rounded animate-pulse w-20" /> : <p className="text-3xl font-bold text-zinc-100 tabular-nums">{value}</p>}
        </div>
    );
}

function BarChart({ data, valueKey, labelKey, formatLabel = (s) => s, height = 160, color = "#6366f1", emptyMessage = "No data available" }: { data: Record<string, string | number>[]; valueKey: string; labelKey: string; formatLabel?: (s: string) => string; height?: number; color?: string; emptyMessage?: string }) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center" style={{ height }}><p className="text-sm text-zinc-600">{emptyMessage}</p></div>;
    const values = data.map((d) => Number(d[valueKey]));
    const max = Math.max(...values, 1);
    return (
        <div className="flex items-end gap-2" style={{ height }}>
            {data.map((d, i) => {
                const val = Number(d[valueKey]); const pct = (val / max) * 100; const label = formatLabel(String(d[labelKey]));
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group" style={{ minWidth: 0 }}>
                        <div className="relative w-full flex flex-col justify-end" style={{ height: height - 28 }}>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-700 text-zinc-100 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">{val}</div>
                            <div className="w-full rounded-t-md transition-all duration-300" style={{ height: `${Math.max(pct, val > 0 ? 3 : 0)}%`, backgroundColor: color, opacity: val === 0 ? 0.2 : 0.85 }} />
                        </div>
                        <span className="text-[10px] text-zinc-500 truncate w-full text-center leading-none">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function NoteViewRow({ note, index }: { note: NoteAnalytics; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const maxViews = Math.max(...note.viewsLast7Days.map((d) => d.count), 1);
    return (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors text-left">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-zinc-400">{index + 1}</span></div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{note.note.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{fmt(note.totalViews)} total views</p>
                </div>
                <div className="hidden sm:flex items-end gap-0.5 h-7" style={{ width: 56 }}>
                    {note.viewsLast7Days.map((d, i) => <div key={i} className="flex-1 rounded-sm bg-indigo-500/60" style={{ height: `${Math.max((d.count / maxViews) * 100, d.count > 0 ? 10 : 5)}%` }} />)}
                </div>
                <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expanded && (
                <div className="px-4 pb-4 border-t border-zinc-800/60">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mt-4 mb-3">Views — last 7 days</p>
                    <BarChart data={note.viewsLast7Days as Record<string, string | number>[]} valueKey="count" labelKey="date" formatLabel={formatDay} height={120} color="#818cf8" />
                </div>
            )}
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
