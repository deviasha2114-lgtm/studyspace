import { Nav } from '@/components/nav';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Navbar */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-indigo-600">
                    StudySpace
                  </span>
                </div>

                {/* Navigation Menu */}
                <div className="hidden md:block">
                  <Nav />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                {/* We'll add user profile dropdown here */}
                <div className="relative">
                  <button
                    className="flex items-center bg-white rounded-full p-1 text-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  >
                    <span className="sr-only">View notifications</span>
                    {/* Notification Icon */}
                    <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.023-.595 1.436L4 16h5z" />
                    </svg>
                    {/* Badge */}
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      3
                    </span>
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative ml-3">
                  <div>
                    <button
                      className="flex max-w-xs items-center rounded-full bg-white bg-opacity-0 px-2 py-1 text-sm font-medium text-gray-400 hover:text-gray-500 hover:bg-white bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                      <span className="ml-2">John Doe</span>
                      {/* Chevron Down Icon */}
                      <svg className="ml-1 h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex={-1}>
                    {/* Active, actively-focused item: bg-gray-100 text-gray-900 */}
                    <div className="py-1" role="none">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="menu-item-0">
                        Your Profile
                      </a>
                    </div>
                    <div className="border-t border-gray-200" role="none"></div>
                    <div className="py-1" role="none">
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="menu-item-1">
                        Settings
                      </a>
                    </div>
                    <div className="border-t border-gray-200" role="none"></div>
                    <div className="py-1" role="none">
                      <button
                        onClick={() => {
                          // Handle logout
                          localStorage.removeItem('token');
                          window.location.href = '/login';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        tabindex="-1"
                        id="menu-item-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}