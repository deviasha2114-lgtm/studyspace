import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Nav } from '@/components/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Hidden on mobile, visible on tablet and desktop */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Horizontal Nav (hidden on mobile, visible on tablet and desktop) */}
          <div className="hidden md:block border-b border-gray-200 dark:border-gray-700">
            <Nav />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}