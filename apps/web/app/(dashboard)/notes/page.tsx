'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note { id: string; title: string; content: string; status: string; createdAt: string; author: { name: string; avatarUrl?: string; }; }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes').then(r => r.json()).then(d => { setNotes(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link href="/notes/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Create Note</Link>
      </div>
      {loading && <p className="text-gray-400">Loading...</p>}
      <div className="grid gap-4">
        {notes.map(n => (
          <Link href={`/notes/${n.id}`} key={n.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition block">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{n.title}</h2>
              <span className={`text-xs px-2 py-1 rounded-full ml-2 ${n.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{n.status}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{n.content}</p>
            <p className="text-xs text-gray-400 mt-2">by {n.author?.name}  {new Date(n.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}
        {!loading && notes.length === 0 && <p className="text-gray-400">No notes found.</p>}
      </div>
    </div>
  );
}
