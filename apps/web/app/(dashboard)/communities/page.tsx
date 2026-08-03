'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Community { id:string; name:string; slug:string; description?:string; isPrivate:boolean; _count:{members:number;notes:number}; }

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/communities').then(r=>r.json()).then(d=>{setCommunities(d);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700 }}>Communities</h1>
        <Link href="/communities/create" style={{ background:'var(--color-primary)', color:'#fff', padding:'0.5rem 1.25rem', borderRadius:'0.5rem', textDecoration:'none', fontWeight:600 }}>+ Create</Link>
      </div>
      {loading && <p style={{ color:'var(--color-text-muted)' }}>Loading...</p>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {communities.map(c => (
          <Link href={`/communities/${c.slug}`} key={c.id} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.25rem', border:'1px solid var(--color-border-default)', textDecoration:'none', display:'block' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <p style={{ color:'var(--color-text-primary)', fontWeight:600 }}>{c.name}</p>
              {c.isPrivate && <span style={{ fontSize:'0.7rem', background:'var(--color-bg-elevated)', color:'var(--color-text-muted)', padding:'0.2rem 0.5rem', borderRadius:'999px' }}>Private</span>}
            </div>
            <p style={{ color:'var(--color-text-secondary)', fontSize:'0.85rem', marginTop:'0.4rem' }}>{c.description ?? 'No description'}</p>
            <div style={{ display:'flex', gap:'1rem', marginTop:'0.75rem', color:'var(--color-text-muted)', fontSize:'0.75rem' }}>
              <span>👥 {c._count?.members ?? 0}</span>
              <span>📝 {c._count?.notes ?? 0}</span>
            </div>
          </Link>
        ))}
        {!loading && communities.length===0 && <p style={{ color:'var(--color-text-muted)' }}>No communities yet.</p>}
      </div>
    </div>
  );
}
