'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<{ notes: any[]; users: any[]; meta: any } | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }, [q, type]);

  useEffect(() => {
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes or users..." className="w-full border rounded-xl px-5 py-3 text-lg mb-4 shadow-sm" />
      <div className="flex gap-2 mb-6">
        {['all','notes','users'].map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium border ${type === t ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {loading && <p className="text-gray-400">Searching...</p>}
      {results && (
        <div className="space-y-6">
          {results.notes?.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-500 mb-3">Notes ({results.meta?.notesTotal})</h2>
              {results.notes.map((n: any) => (
                <Link href={`/notes/${n.id}`} key={n.id} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md mb-2">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: n.snippet }} />
                </Link>
              ))}
            </div>
          )}
          {results.users?.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-500 mb-3">People ({results.meta?.usersTotal})</h2>
              {results.users.map((u: any) => (
                <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"></div>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-gray-400">{u.noteCount} notes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.meta?.total === 0 && <p className="text-gray-400">No results found for "{q}"</p>}
        </div>
      )}
    </div>
  );
}
