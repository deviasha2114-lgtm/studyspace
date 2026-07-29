'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Note { id:string; title:string; content:string; status:string; createdAt:string; fileUrl?:string; author:{name:string}; community?:{name:string}; }

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState<Note|null>(null);

  useEffect(() => {
    fetch(`/api/notes/${id}`).then(r=>r.json()).then(setNote).catch(()=>{});
  }, [id]);

  if (!note) return <div style={{ textAlign:'center', padding:'5rem', color:'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto' }}>
      <div style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'2rem', border:'1px solid var(--color-border-default)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
          <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.75rem', fontWeight:700 }}>{note.title}</h1>
          <span style={{ fontSize:'0.75rem', padding:'0.25rem 0.75rem', borderRadius:'999px', background:'var(--color-bg-elevated)', color:note.status==='APPROVED'?'#4ADE80':'#FBBF24', whiteSpace:'nowrap', marginLeft:'1rem' }}>{note.status}</span>
        </div>
        <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginBottom:'1.5rem' }}>by {note.author?.name} · {new Date(note.createdAt).toLocaleDateString()}{note.community ? ` · ${note.community.name}` : ''}</p>
        <div style={{ color:'var(--color-text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{note.content}</div>
        {note.fileUrl && <a href={note.fileUrl} target="_blank" style={{ display:'inline-block', marginTop:'1.5rem', color:'var(--color-primary)' }}>📎 View Attachment</a>}
      </div>
    </div>
  );
}
