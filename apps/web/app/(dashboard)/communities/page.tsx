'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Community { id: string; name: string; slug: string; description?: string; isPrivate: boolean; _count: { members: number; notes: number; }; }

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/communities').then(r => r.json()).then(d => { setCommunities(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Link href="/communities/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Create</Link>
      </div>
      {loading && <p className="text-gray-400">Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map(c => (
          <Link href={`/communities/${c.slug}`} key={c.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition block">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{c.name}</h2>
              {c.isPrivate && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Private</span>}
            </div>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{c.description ?? 'No description'}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <span> {c._count?.members ?? 0} members</span>
              <span> {c._count?.notes ?? 0} notes</span>
            </div>
          </Link>
        ))}
        {!loading && communities.length === 0 && <p className="text-gray-400">No communities yet.</p>}
      </div>
    </div>
  );
}
