'use client';
import { useEffect, useState } from 'react';

interface VideoRoom { id:string; hmsRoomId:string; isActive:boolean; createdAt:string; community?:{name:string}; createdBy:{name:string}; }

export default function LiveStudyPage() {
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/video-rooms').then(r=>r.json()).then(d=>{setRooms(d);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  async function createRoom() {
    const res = await fetch('/api/video-rooms', { method:'POST' });
    if (res.ok) { const room = await res.json(); window.open(`/live/${room.id}`, '_blank'); }
  }

  const activeRooms = rooms.filter(r=>r.isActive);

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700 }}>🔴 Live Study Rooms</h1>
        <button onClick={createRoom} style={{ background:'#ef4444', color:'#fff', border:'none', padding:'0.5rem 1.25rem', borderRadius:'0.5rem', fontWeight:600, cursor:'pointer' }}>+ Start Room</button>
      </div>
      {loading && <p style={{ color:'var(--color-text-muted)' }}>Loading...</p>}
      {activeRooms.map(r => (
        <div key={r.id} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.75rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ width:'8px', height:'8px', background:'#ef4444', borderRadius:'50%', display:'inline-block' }}></span>
              <span style={{ color:'var(--color-text-primary)', fontWeight:600 }}>{r.community?.name ?? 'Open Room'}</span>
            </div>
            <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginTop:'0.25rem' }}>by {r.createdBy?.name}</p>
          </div>
          <a href={`/live/${r.id}`} style={{ background:'var(--color-primary)', color:'#fff', padding:'0.5rem 1rem', borderRadius:'0.5rem', textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}>Join</a>
        </div>
      ))}
      {!loading && activeRooms.length===0 && <p style={{ color:'var(--color-text-muted)' }}>No active rooms. Start one!</p>}
    </div>
  );
}
