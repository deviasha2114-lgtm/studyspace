'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Community { id: string; name: string; description?: string; isPrivate: boolean; members: { user: { name: string; }; role: string; }[]; notes: { id: string; title: string; status: string; author: { name: string; }; }[]; }

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    fetch(`/api/communities/${slug}`).then(r => r.json()).then(setCommunity).catch(() => {});
  }, [slug]);

  if (!community) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold">{community.name}</h1>
        <p className="text-gray-500 mt-1">{community.description}</p>
        <p className="text-sm text-gray-400 mt-2"> {community.members?.length ?? 0} members</p>
      </div>
      <h2 className="text-lg font-semibold mb-4">Notes</h2>
      <div className="grid gap-3">
        {community.notes?.map(n => (
          <Link href={`/notes/${n.id}`} key={n.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition block flex justify-between">
            <span className="font-medium">{n.title}</span>
            <span className="text-sm text-gray-400">{n.author?.name}</span>
          </Link>
        ))}
        {community.notes?.length === 0 && <p className="text-gray-400">No notes in this community yet.</p>}
      </div>
    </div>
  );
}
