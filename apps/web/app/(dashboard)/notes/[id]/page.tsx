'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Note { id: string; title: string; content: string; status: string; createdAt: string; fileUrl?: string; author: { name: string; avatarUrl?: string; }; community: { name: string; }; }

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    fetch(`/api/notes/${id}`).then(r => r.json()).then(setNote).catch(() => {});
  }, [id]);

  if (!note) return <div className="text-center py-20 text-gray-400">Loading note...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{note.title}</h1>
          <span className={`text-xs px-3 py-1 rounded-full ${note.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{note.status}</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">by {note.author?.name}  {new Date(note.createdAt).toLocaleDateString()} {note.community && ` ${note.community.name}`}</p>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{note.content}</div>
        {note.fileUrl && <a href={note.fileUrl} target="_blank" className="mt-6 inline-block text-blue-600 hover:underline"> View Attachment</a>}
      </div>
    </div>
  );
}
