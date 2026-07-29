'use client';
import { useEffect, useState } from 'react';

interface VideoRoom { id: string; hmsRoomId: string; isActive: boolean; createdAt: string; community?: { name: string; }; createdBy: { name: string; }; }

export default function LiveStudyPage() {
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/video-rooms').then(r => r.json()).then(d => { setRooms(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function createRoom() {
    const res = await fetch('/api/video-rooms', { method: 'POST' });
    if (res.ok) { const room = await res.json(); window.open(`/live/${room.id}`, '_blank'); }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold"> Live Study Rooms</h1>
        <button onClick={createRoom} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">+ Start Room</button>
      </div>
      {loading && <p className="text-gray-400">Loading rooms...</p>}
      <div className="grid gap-4">
        {rooms.filter(r => r.isActive).map(r => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-medium">{r.community?.name ?? 'Open Room'}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Started by {r.createdBy?.name}</p>
            </div>
            <a href={`/live/${r.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Join</a>
          </div>
        ))}
        {!loading && rooms.filter(r => r.isActive).length === 0 && <p className="text-gray-400">No active rooms. Start one!</p>}
      </div>
    </div>
  );
}
