'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Community { id:string; name:string; description?:string; members:{user:{name:string};role:string}[]; notes:{id:string;title:string;status:string;author:{name:string}}[]; }

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const [community, setCommunity] = useState<Community|null>(null);

  useEffect(() => {
    fetch(`/api/communities/${slug}`).then(r=>r.json()).then(setCommunity).catch(()=>{});
  }, [slug]);

  if (!community) return <div style={{ textAlign:'center', padding:'5rem', color:'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto' }}>
      <div style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.5rem', border:'1px solid var(--color-border-default)', marginBottom:'1.5rem' }}>
        <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700 }}>{community.name}</h1>
        <p style={{ color:'var(--color-text-secondary)', marginTop:'0.4rem' }}>{community.description}</p>
        <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginTop:'0.5rem' }}>👥 {community.members?.length ?? 0} members</p>
      </div>
      <h2 style={{ color:'var(--color-text-primary)', fontWeight:600, marginBottom:'1rem' }}>Notes</h2>
      {community.notes?.map(n => (
        <Link href={`/notes/${n.id}`} key={n.id} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1rem 1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.75rem', display:'flex', justifyContent:'space-between', alignItems:'center', textDecoration:'none' }}>
          <span style={{ color:'var(--color-text-primary)', fontWeight:500 }}>{n.title}</span>
          <span style={{ color:'var(--color-text-muted)', fontSize:'0.85rem' }}>{n.author?.name}</span>
        </Link>
      ))}
      {community.notes?.length===0 && <p style={{ color:'var(--color-text-muted)' }}>No notes yet.</p>}
    </div>
  );
}
