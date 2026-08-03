'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNotePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title:'', content:'' });
  const [loading, setLoading] = useState(false);
  const input = { background:'var(--color-bg-elevated)', border:'1px solid var(--color-border-default)', color:'var(--color-text-primary)', borderRadius:'0.5rem', padding:'0.75rem 1rem', outline:'none', width:'100%', fontFamily:'inherit' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/notes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    setLoading(false);
    if (res.ok) router.push('/notes');
  }

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto' }}>
      <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Create Note</h1>
      <form onSubmit={handleSubmit} style={{ background:'var(--color-bg-surface)', borderRadius:'0.75rem', padding:'1.5rem', border:'1px solid var(--color-border-default)', display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div>
          <label style={{ color:'var(--color-text-secondary)', fontSize:'0.875rem', display:'block', marginBottom:'0.4rem' }}>Title</label>
          <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Note title..." style={input} required />
        </div>
        <div>
          <label style={{ color:'var(--color-text-secondary)', fontSize:'0.875rem', display:'block', marginBottom:'0.4rem' }}>Content</label>
          <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Write your note here..." style={{ ...input, height:'200px', resize:'vertical' }} required />
        </div>
        <button type="submit" disabled={loading} style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:'0.5rem', padding:'0.75rem', fontWeight:600, cursor:'pointer', opacity:loading?0.6:1 }}>
          {loading ? 'Submitting...' : 'Submit Note'}
        </button>
      </form>
    </div>
  );
}
