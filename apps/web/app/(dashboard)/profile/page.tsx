'use client';
import { useEffect, useState } from 'react';

interface User { id: string; name: string; email: string; avatarUrl?: string; bio?: string; }
interface Note { id: string; title: string; status: string; createdAt: string; }

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(setUser).catch(() => {});
    fetch('/api/notes/mine').then(r => r.json()).then(setNotes).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
          {user?.avatarUrl ? <img src={user.avatarUrl} className="w-20 h-20 rounded-full object-cover" /> : ''}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.name ?? 'Loading...'}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-600 mt-1">{user?.bio ?? 'No bio yet'}</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">My Notes ({notes.length})</h2>
      <div className="grid gap-4">
        {notes.length === 0 && <p className="text-gray-400">No notes yet. <a href="/notes/create" className="text-blue-600">Create one!</a></p>}
        {notes.map(n => (
          <div key={n.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-medium">{n.title}</h3>
              <p className="text-sm text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${n.status === 'APPROVED' ? 'bg-green-100 text-green-700' : n.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{n.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
