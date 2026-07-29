import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--color-bg-base)' }}>
      <aside style={{ width:'240px', background:'var(--color-bg-surface)', borderRight:'1px solid var(--color-border-default)', display:'flex', flexDirection:'column', padding:'1.5rem 1rem', gap:'0.25rem', position:'fixed', height:'100vh' }}>
        <h1 style={{ color:'var(--color-primary)', fontWeight:800, fontSize:'1.25rem', marginBottom:'1.5rem', paddingLeft:'0.75rem' }}>StudySpace</h1>
        {[
          { href:'/profile', label:'🏠 Home' },
          { href:'/notes', label:'📝 Notes' },
          { href:'/notes/create', label:'➕ Create Note' },
          { href:'/communities', label:'👥 Communities' },
          { href:'/live', label:'🔴 Live Study' },
          { href:'/search', label:'🔍 Search' },
          { href:'/profile', label:'👤 Profile' },
        ].map(item => (
          <Link key={item.href+item.label} href={item.href} style={{ padding:'0.6rem 0.75rem', borderRadius:'0.5rem', color:'var(--color-text-secondary)', textDecoration:'none', fontSize:'0.9rem', display:'block' }}
            onMouseOver={e => (e.currentTarget.style.background='var(--color-bg-elevated)')}
            onMouseOut={e => (e.currentTarget.style.background='transparent')}
          >{item.label}</Link>
        ))}
      </aside>
      <main style={{ marginLeft:'240px', flex:1, padding:'2rem' }}>{children}</main>
    </div>
  );
}
