'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const input = { background:'var(--color-bg-elevated)', border:'1px solid var(--color-border-default)', color:'var(--color-text-primary)', borderRadius:'0.5rem', padding:'0.75rem 1rem', outline:'none', width:'100%' };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    if (res.ok) router.push('/login');
    else setError('Signup failed. Try again.');
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-bg-base)' }}>
      <div style={{ background:'var(--color-bg-surface)', padding:'2rem', borderRadius:'1rem', width:'100%', maxWidth:'420px', border:'1px solid var(--color-border-default)' }}>
        <h1 style={{ color:'var(--color-text-primary)', fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem', textAlign:'center' }}>Join StudySpace</h1>
        {error && <p style={{ color:'#f87171', marginBottom:'1rem', fontSize:'0.875rem' }}>{error}</p>}
        <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <input type="text" placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={input} />
          <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required style={input} />
          <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={input} />
          <button type="submit" style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:'0.5rem', padding:'0.75rem', fontWeight:600, cursor:'pointer' }}>Create Account</button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1rem', color:'var(--color-text-secondary)', fontSize:'0.875rem' }}>Already have an account? <a href="/login" style={{ color:'var(--color-primary)' }}>Login</a></p>
      </div>
    </div>
  );
}
