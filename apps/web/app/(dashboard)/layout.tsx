'use client';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--color-bg-base)' }}>
      <aside style={{ width:'240px', background:'var(--color-bg-surface)', borderRight:'1px solid var(--color-border-default)', display:'flex', flexDirection:'column', padding:'1.5rem 1rem', gap:'0.25rem', position:'fixed', height:'100vh' }}>
        <h1 style={{ color:'var(--color-primary)', fontWeight:800, fontSize:'1.25rem', marginBottom:'1.5rem', paddingLeft:'0.75rem' }}>StudySpace</h1>
        <Link href="/profile" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>🏠 Home</Link>
        <Link href="/notes" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>📝 Notes</Link>
        <Link href="/notes/create" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>➕ Create Note</Link>
        <Link href="/communities" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>👥 Communities</Link>
        <Link href="/live" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>🔴 Live Study</Link>
        <Link href="/search" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem' }}>🔍 Search</Link>
        <Link href="/profile" style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem', marginTop:'auto' }}>👤 Profile</Link>
      </aside>
      <main style={{ marginLeft:'240px', flex:1, padding:'2rem' }}>{children}</main>
    </div>
  );
}
