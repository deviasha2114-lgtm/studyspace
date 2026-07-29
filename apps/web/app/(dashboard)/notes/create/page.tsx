'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNotePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '', communityId: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push('/notes');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Note</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-4 py-2" required placeholder="Note title..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-4 py-2 h-48 resize-none" required placeholder="Write your note here..." />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Note'}
        </button>
      </form>
    </div>
  );
}
