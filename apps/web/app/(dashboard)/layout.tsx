import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r flex flex-col p-6 gap-2 fixed h-full">
        <h1 className="text-xl font-bold text-blue-600 mb-6">StudySpace</h1>
        <Link href="/profile" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Home</Link>
        <Link href="/notes" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Notes</Link>
        <Link href="/notes/create" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Create Note</Link>
        <Link href="/communities" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Communities</Link>
        <Link href="/live" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Live Study</Link>
        <Link href="/search" className="px-4 py-2 rounded-lg hover:bg-gray-100"> Search</Link>
        <Link href="/profile" className="px-4 py-2 rounded-lg hover:bg-gray-100 mt-auto"> Profile</Link>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
