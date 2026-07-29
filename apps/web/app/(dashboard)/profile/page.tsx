'use client';
import { useEffect, useState } from 'react';

interface User { id:string; name:string; email:string; avatarUrl?:string; bio?:string; }
interface Note { id:string; title:string; status:string; createdAt:string; }

const card = { background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.75rem' };

export default function ProfilePage() {
  const [user, setUser] = useState<User|null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('/api/users/me').then(r=>r.json()).then(setUser).catch(()=>{});
    fetch('/api/notes/mine').then(r=>r.json()).then(setNotes).catch(()=>{});
  }, []);

  const statusColor = (s:string) => s==='APPROVED'?'#4ADE80':s==='PENDING'?'#FBBF24':'#F87171';

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto' }}>
      <div style={{ ...card, display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'var(--color-primary-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
          {user?.avatarUrl ? <img src={user.avatarUrl} style={{ width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover' }} alt="" /> : '👤'}
        </div>
        <div>
          <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700 }}>{user?.name ?? 'Loading...'}</h1>
          <p style={{ color:'var(--color-text-secondary)', fontSize:'0.875rem' }}>{user?.email}</p>
          <p style={{ color:'var(--color-text-muted)', marginTop:'0.25rem', fontSize:'0.875rem' }}>{user?.bio ?? 'No bio yet'}</p>
        </div>
      </div>
      <h2 style={{ color:'var(--color-text-primary)', fontWeight:600, marginBottom:'1rem' }}>My Notes ({notes.length})</h2>
      {notes.length===0 && <p style={{ color:'var(--color-text-muted)' }}>No notes yet. <a href="/notes/create" style={{ color:'var(--color-primary)' }}>Create one!</a></p>}
      {notes.map(n => (
        <div key={n.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ color:'var(--color-text-primary)', fontWeight:500 }}>{n.title}</p>
            <p style={{ color:'var(--color-text-muted)', fontSize:'0.75rem', marginTop:'0.25rem' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
          </div>
          <span style={{ fontSize:'0.75rem', padding:'0.25rem 0.75rem', borderRadius:'999px', background:'var(--color-bg-elevated)', color:statusColor(n.status) }}>{n.status}</span>
        </div>
      ))}
    </div>
  );
}
