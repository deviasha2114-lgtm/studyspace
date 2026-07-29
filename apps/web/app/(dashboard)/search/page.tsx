'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<{notes:any[];users:any[];meta:any}|null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }, [q, type]);

  useEffect(() => { const t = setTimeout(search, 300); return () => clearTimeout(t); }, [search]);

  const pill = (t: string) => ({
    padding:'0.4rem 1rem', borderRadius:'999px', fontSize:'0.85rem', fontWeight:600, cursor:'pointer',
    background: type===t ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
    color: type===t ? '#fff' : 'var(--color-text-secondary)',
    border: '1px solid ' + (type===t ? 'var(--color-primary)' : 'var(--color-border-default)'),
  });

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto' }}>
      <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Search</h1>
      <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search notes or users..." style={{ width:'100%', background:'var(--color-bg-surface)', border:'1px solid var(--color-border-default)', color:'var(--color-text-primary)', borderRadius:'0.75rem', padding:'0.85rem 1.25rem', fontSize:'1rem', outline:'none', marginBottom:'1rem' }} />
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        {['all','notes','users'].map(t => <button key={t} onClick={()=>setType(t)} style={pill(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {loading && <p style={{ color:'var(--color-text-muted)' }}>Searching...</p>}
      {results && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          {results.notes?.length > 0 && (
            <div>
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>NOTES ({results.meta?.notesTotal})</p>
              {results.notes.map((n:any) => (
                <Link href={`/notes/${n.id}`} key={n.id} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1rem 1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.5rem', display:'block', textDecoration:'none' }}>
                  <p style={{ color:'var(--color-text-primary)', fontWeight:500 }}>{n.title}</p>
                  <p style={{ color:'var(--color-text-secondary)', fontSize:'0.8rem', marginTop:'0.25rem' }} dangerouslySetInnerHTML={{ __html:n.snippet }} />
                </Link>
              ))}
            </div>
          )}
          {results.users?.length > 0 && (
            <div>
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>PEOPLE ({results.meta?.usersTotal})</p>
              {results.users.map((u:any) => (
                <div key={u.id} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1rem 1.25rem', border:'1px solid var(--color-border-default)', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--color-primary-muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>👤</div>
                  <div>
                    <p style={{ color:'var(--color-text-primary)', fontWeight:500 }}>{u.name}</p>
                    <p style={{ color:'var(--color-text-muted)', fontSize:'0.8rem' }}>{u.noteCount} notes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.meta?.total===0 && <p style={{ color:'var(--color-text-muted)' }}>No results for "{q}"</p>}
        </div>
      )}
    </div>
  );
}
