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

function AnalyticsContent() {
    const { data: session } = useSession();
    const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
    const [noteAnalytics, setNoteAnalytics] = useState<NoteAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user) return;
        const userId = (session.user as { id?: string }).id;
        if (!userId) return;
        setLoading(true); setError(null);
        fetch(`/api/analytics/user/${userId}`)
            .then((r) => { if (!r.ok) throw new Error("Failed to load analytics"); return r.json(); })
            .then(async (userData: UserAnalytics & { noteIds?: string[] }) => {
                setUserAnalytics(userData);
                if (userData.noteIds && userData.noteIds.length > 0) {
                    const noteData = await Promise.all(userData.noteIds.slice(0, 10).map((id) => fetch(`/api/analytics/note/${id}`).then((r) => r.ok ? r.json() : null).catch(() => null)));
                    setNoteAnalytics(noteData.filter(Boolean) as NoteAnalytics[]);
                }
            })
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, [session]);

    const stats = userAnalytics?.stats;
    const statCards = [
        { label: "Notes", value: fmt(stats?.totalNotes ?? 0), accent: "indigo", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { label: "Total Views", value: fmt(stats?.totalViews ?? 0), accent: "violet", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
        { label: "Followers", value: fmt(stats?.followers ?? 0), accent: "sky", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { label: "Following", value: fmt(stats?.following ?? 0), accent: "emerald", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
        { label: "Communities", value: fmt(stats?.communities ?? 0), accent: "amber", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8"><h1 className="text-2xl font-bold text-zinc-100 mb-1">Analytics</h1><p className="text-sm text-zinc-500">Your content performance at a glance</p></div>
                {error && <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-4 mb-6 flex items-center gap-3"><svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="text-sm text-red-300">{error}. Try refreshing.</p></div>}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">{statCards.map((card) => <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} accent={card.accent} loading={loading} />)}</div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h2 className="font-semibold text-zinc-100">Notes Published</h2><p className="text-xs text-zinc-500 mt-0.5">Per month, this year</p></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80" /><span className="text-xs text-zinc-500">Notes</span></div>
                    </div>
                    {loading ? <div className="flex items-end gap-2 h-40">{[...Array(8)].map((_, i) => <div key={i} className="flex-1 bg-zinc-800 rounded-t animate-pulse" style={{ height: `${30 + (i * 7) % 50}%` }} />)}</div> : <BarChart data={(userAnalytics?.notesPerMonth ?? []) as Record<string, string | number>[]} valueKey="count" labelKey="month" formatLabel={formatMonth} height={180} color="#6366f1" emptyMessage="No notes published yet" />}
                </div>
                <div>
                    <div className="mb-4"><h2 className="font-semibold text-zinc-100">Note Performance</h2><p className="text-xs text-zinc-500 mt-0.5">Views over the last 7 days</p></div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 animate-pulse"><div className="flex items-center gap-4"><div className="w-7 h-7 bg-zinc-800 rounded-lg" /><div className="flex-1 space-y-2"><div className="h-4 bg-zinc-800 rounded w-1/2" /><div className="h-3 bg-zinc-800 rounded w-24" /></div></div></div>)}</div>
                    ) : noteAnalytics.length === 0 ? (
                        <div className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center py-14 text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3"><svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                            <p className="text-zinc-400 font-medium text-sm">No note data yet</p>
                            <p className="text-zinc-600 text-xs mt-1">Publish a note to start seeing view stats</p>
                        </div>
                    ) : (
                        <div className="space-y-2">{noteAnalytics.map((note, i) => <NoteViewRow key={note.note.id} note={note} index={i} />)}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsContent

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div />}>
      <AnalyticsContent />
    </Suspense>
  );
}