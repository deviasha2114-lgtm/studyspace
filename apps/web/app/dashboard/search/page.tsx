"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type SearchType = "ALL" | "NOTES" | "USER" | "COMMUNITY";

interface NoteResult {
    id: string; title: string; content: string; status: string;
    author: { id: string; name: string; avatarUrl: string | null };
    community?: { id: string; name: string } | null;
    _count?: { views: number }; createdAt: string;
}
interface UserResult {
    id: string; name: string; avatarUrl: string | null; bio: string | null;
    _count?: { followers: number; notes: number };
}
interface CommunityResult {
    id: string; name: string; description: string | null;
    _count?: { members: number; notes: number };
}
interface SearchResults { notes?: NoteResult[]; users?: UserResult[]; communities?: CommunityResult[]; total?: number; }
interface SearchHistoryItem { id: string; query: string; type: SearchType; createdAt: string; }

const TABS: { label: string; value: SearchType }[] = [
    { label: "All", value: "ALL" }, { label: "Notes", value: "NOTES" },
    { label: "People", value: "USER" }, { label: "Communities", value: "COMMUNITY" },
];

function Avatar({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
    return <div className="rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold select-none" style={{ width: size, height: size, fontSize: size * 0.35 }}>{initials}</div>;
}

function NoteCard({ note }: { note: NoteResult }) {
    const router = useRouter();
    const preview = note.content?.replace(/<[^>]*>/g, "").slice(0, 120) || "No preview";
    return (
        <button onClick={() => router.push(`/dashboard/notes/${note.id}`)} className="w-full text-left group rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-200 p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">{note.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{preview}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Avatar src={note.author.avatarUrl} name={note.author.name} size={16} />{note.author.name}</span>
                        {note.community && <><span className="text-zinc-600">·</span><span>{note.community.name}</span></>}
                        {note._count?.views !== undefined && <><span className="text-zinc-600">·</span><span>{note._count.views} views</span></>}
                    </div>
                </div>
            </div>
        </button>
    );
}

function UserCard({ user }: { user: UserResult }) {
    const router = useRouter();
    return (
        <button onClick={() => router.push(`/dashboard/profile/${user.id}`)} className="w-full text-left group rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} name={user.name} size={44} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">{user.name}</h3>
                    {user.bio && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{user.bio}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {user._count?.followers !== undefined && <span>{user._count.followers} followers</span>}
                        {user._count?.notes !== undefined && <><span className="text-zinc-600">·</span><span>{user._count.notes} notes</span></>}
                    </div>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>
        </button>
    );
}

function CommunityCard({ community }: { community: CommunityResult }) {
    const router = useRouter();
    return (
        <button onClick={() => router.push(`/dashboard/communities/${community.id}`)} className="w-full text-left group rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-200 p-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">{community.name}</h3>
                    {community.description && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{community.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {community._count?.members !== undefined && <span>{community._count.members} members</span>}
                        {community._count?.notes !== undefined && <><span className="text-zinc-600">·</span><span>{community._count.notes} notes</span></>}
                    </div>
                </div>
            </div>
        </button>
    );
}

function EmptyState({ query, tab }: { query: string; tab: SearchType }) {
    const messages: Record<SearchType, string> = { ALL: `No results for "${query}"`, NOTES: `No notes match "${query}"`, USER: `No people match "${query}"`, COMMUNITY: `No communities match "${query}"` };
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-zinc-300 font-medium">{messages[tab]}</p>
            <p className="text-zinc-500 text-sm mt-1">Try different keywords or browse trending topics</p>
        </div>
    );
}

export default function SearchPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [activeTab, setActiveTab] = useState<SearchType>((searchParams.get("type") as SearchType) || "ALL");
    const [results, setResults] = useState<SearchResults>({});
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [trending, setTrending] = useState<string[]>([]);
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!session) return;
        Promise.all([fetch("/api/search/trending").then((r) => r.json()).catch(() => []), fetch("/api/search/history").then((r) => r.json()).catch(() => [])]).then(([t, h]) => { setTrending(Array.isArray(t) ? t : t?.trending || []); setHistory(Array.isArray(h) ? h : h?.history || []); });
    }, [session]);

    useEffect(() => { if (query) runSearch(query, activeTab); }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const fetchSuggestions = useCallback((q: string) => {
        if (!q.trim()) { setSuggestions([]); return; }
        fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => setSuggestions(Array.isArray(d) ? d : d?.suggestions || [])).catch(() => setSuggestions([]));
    }, []);

    function handleInputChange(val: string) { setQuery(val); setShowDropdown(true); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchSuggestions(val), 250); }

    async function runSearch(q: string, type: SearchType) {
        if (!q.trim()) return;
        setLoading(true); setHasSearched(true); setShowDropdown(false);
        router.replace(`/dashboard/search?q=${encodeURIComponent(q)}&type=${type}`, { scroll: false });
        try { const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`); setResults(await res.json()); } catch { setResults({}); } finally { setLoading(false); }
    }

    function handleTabChange(tab: SearchType) { setActiveTab(tab); if (query) runSearch(query, tab); }
    function handleSuggestionClick(s: string) { setQuery(s); runSearch(s, activeTab); }
    async function clearHistory() { await fetch("/api/search/history", { method: "DELETE" }); setHistory([]); }

    const notes = results.notes || []; const users = results.users || []; const communities = results.communities || [];
    const showNotes = activeTab === "ALL" || activeTab === "NOTES";
    const showUsers = activeTab === "ALL" || activeTab === "USER";
    const showCommunities = activeTab === "ALL" || activeTab === "COMMUNITY";
    const isEmpty = hasSearched && !loading && notes.length === 0 && users.length === 0 && communities.length === 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8"><h1 className="text-2xl font-bold text-zinc-100 mb-1">Search</h1><p className="text-sm text-zinc-500">Find notes, people, and communities</p></div>
                <div className="relative mb-6">
                    <div className="relative flex items-center">
                        <svg className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input ref={inputRef} type="text" value={query} onChange={(e) => handleInputChange(e.target.value)} onFocus={() => setShowDropdown(true)} onKeyDown={(e) => { if (e.key === "Enter") runSearch(query, activeTab); if (e.key === "Escape") setShowDropdown(false); }} placeholder="Search notes, people, communities…" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-12 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                        {query && <button onClick={() => { setQuery(""); setResults({}); setHasSearched(false); setSuggestions([]); }} className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                    </div>
                    {showDropdown && (
                        <div ref={dropdownRef} className="absolute top-full mt-1.5 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                            {suggestions.length > 0 ? (
                                <div className="py-1">{suggestions.map((s, i) => <button key={i} onClick={() => handleSuggestionClick(s)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors text-left"><svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>{s}</button>)}</div>
                            ) : (
                                <div className="py-2">
                                    {history.length > 0 && <div><div className="flex items-center justify-between px-4 py-2"><span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Recent</span><button onClick={clearHistory} className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors">Clear</button></div>{history.slice(0, 5).map((h) => <button key={h.id} onClick={() => handleSuggestionClick(h.query)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors text-left"><svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="flex-1 truncate">{h.query}</span><span className="text-xs text-zinc-600">{h.type !== "ALL" ? h.type : ""}</span></button>)}</div>}
                                    {trending.length > 0 && <div className={history.length > 0 ? "border-t border-zinc-800 mt-1 pt-1" : ""}><div className="px-4 py-2"><span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Trending</span></div>{trending.slice(0, 5).map((t, i) => <button key={i} onClick={() => handleSuggestionClick(t)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors text-left"><svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>{t}</button>)}</div>}
                                    {history.length === 0 && trending.length === 0 && <p className="px-4 py-4 text-sm text-zinc-500">Start typing to search…</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">{TABS.map((tab) => <button key={tab.value} onClick={() => handleTabChange(tab.value)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.value ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}>{tab.label}</button>)}</div>
                {loading && <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 animate-pulse"><div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-zinc-800" /><div className="flex-1 space-y-2"><div className="h-4 bg-zinc-800 rounded w-2/3" /><div className="h-3 bg-zinc-800 rounded w-full" /><div className="h-3 bg-zinc-800 rounded w-1/2" /></div></div></div>)}</div>}
                {isEmpty && <EmptyState query={query} tab={activeTab} />}
                {!loading && !isEmpty && hasSearched && (
                    <div className="space-y-6">
                        {showNotes && notes.length > 0 && <section>{activeTab === "ALL" && <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Notes</h2>}<div className="space-y-2">{notes.map((note) => <NoteCard key={note.id} note={note} />)}</div></section>}
                        {showUsers && users.length > 0 && <section>{activeTab === "ALL" && <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">People</h2>}<div className="space-y-2">{users.map((user) => <UserCard key={user.id} user={user} />)}</div></section>}
                        {showCommunities && communities.length > 0 && <section>{activeTab === "ALL" && <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Communities</h2>}<div className="space-y-2">{communities.map((c) => <CommunityCard key={c.id} community={c} />)}</div></section>}
                    </div>
                )}
                {!hasSearched && !loading && trending.length > 0 && (
                    <div className="py-8"><h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Trending on StudySpace</h2><div className="flex flex-wrap gap-2">{trending.map((t, i) => <button key={i} onClick={() => { setQuery(t); runSearch(t, activeTab); }} className="px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 hover:border-indigo-500 hover:text-indigo-300 transition-all">{t}</button>)}</div></div>
                )}
            </div>
        </div>
    );
}