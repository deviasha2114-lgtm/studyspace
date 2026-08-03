'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note { id:string; title:string; content:string; status:string; createdAt:string; author:{name:string}; }
const card = { background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.75rem', display:'block', textDecoration:'none' };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes').then(r=>r.json()).then(d=>{setNotes(d);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700 }}>Notes</h1>
        <Link href="/notes/create" style={{ background:'var(--color-primary)', color:'#fff', padding:'0.5rem 1.25rem', borderRadius:'0.5rem', textDecoration:'none', fontWeight:600 }}>+ Create</Link>
      </div>
      {loading && <p style={{ color:'var(--color-text-muted)' }}>Loading...</p>}
      {notes.map(n => (
        <Link href={`/notes/${n.id}`} key={n.id} style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <p style={{ color:'var(--color-text-primary)', fontWeight:600, fontSize:'1rem' }}>{n.title}</p>
            <span style={{ fontSize:'0.7rem', padding:'0.2rem 0.6rem', borderRadius:'999px', background:'var(--color-bg-elevated)', color:n.status==='APPROVED'?'#4ADE80':'#FBBF24', marginLeft:'0.5rem', whiteSpace:'nowrap' }}>{n.status}</span>
          </div>
          <p style={{ color:'var(--color-text-secondary)', fontSize:'0.85rem', marginTop:'0.4rem' }}>{n.content?.slice(0,120)}...</p>
          <p style={{ color:'var(--color-text-muted)', fontSize:'0.75rem', marginTop:'0.5rem' }}>by {n.author?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
        </Link>
      ))}
      {!loading && notes.length===0 && <p style={{ color:'var(--color-text-muted)' }}>No notes found.</p>}
    </div>
  );
}
