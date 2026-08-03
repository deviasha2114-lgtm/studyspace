import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl font-bold text-indigo-600">StudySpace</span>
      </div>

      <nav className="mt-8 space-y-1">
        {/* Dashboard */}
        <a href="/dashboard"
           className={`${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-9 8h4"/>
          </svg>
          <span className="ml-3">Dashboard</span>
        </a>

        {/* Study Rooms */}
        <a href="/study-rooms"
           className={`${pathname.startsWith('/study-rooms') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 12h14M5 19h14M5 7h14"/>
          </svg>
          <span className="ml-3">Study Rooms</span>
        </a>

        {/* Clubs */}
        <a href="/clubs"
           className={`${pathname.startsWith('/clubs') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.516.516 0 01-.354.146l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L11 9.414V6a1 1 0 100-2v3.414l1.146-1.146a.5.5 0 01.708 0l1.5 1.5a.5 5 0 01-.708.708z"/>
          </svg>
          <span className="ml-3">Clubs</span>
        </a>

        {/* Resources */}
        <a href="/resources"
           className={`${pathname.startsWith('/resources') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="ml-3">Resources</span>
        </a>

        {/* Flashcards */}
        <a href="/dashboard/flashcards"
           className={`${pathname.startsWith('/dashboard/flashcards') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3"/>
          </svg>
          <span className="ml-3">Flashcards</span>
        </a>

        {/* Messages */}
        <a href="/messages"
           className={`${pathname.startsWith('/messages') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 11l3 3m0 0l3-3m-3 3V8a5 5 0 015-5h2a5 5 0 015 5v3m-6 5H5a2 2 0 01-2-2v-3a2 2 0 012-2h2.586a1 1 0 00.707-1.707l-1.414-1.414A2 2 0 0116.414 6H19a2 2 0 012 2v2a2 2 0 01-2 2h-1.414l-1.414 1.414A2 2 0 0113 16h-5a2 2 0 01-2-2v-3"/>
          </svg>
          <span className="ml-3">Messages</span>
        </a>

        {/* Calendar */}
        <a href="/calendar"
           className={`${pathname.startsWith('/calendar') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWeight={2}
                  d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V9a2 2 0 002-2H5a2 2 0 002-2v10a2 2 0 002 2z"/>
          </svg>
          <span className="ml-3">Calendar</span>
        </a>

        {/* Performance */}
        <a href="/dashboard/performance"
           className={`${pathname.startsWith('/dashboard/performance') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3"/>
          </svg>
          <span className="ml-3">Performance</span>
        </a>

        {/* Reports */}
        <a href="/reports"
           className={`${pathname.startsWith('/reports') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWeight={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span className="ml-3">Reports</span>
        </a>

        {/* Settings */}
        <a href="/dashboard/settings"
           className={`${pathname.startsWith('/dashboard/settings') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3"/>
          </svg>
          <span className="ml-3">Settings</span>
        </a>

        {/* Subscription */}
        <a href="/dashboard/subscription"
           className={`${pathname.startsWith('/dashboard/subscription') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}}
                     flex items-center px-3 py-2 rounded-md text-sm font-medium`}>
          <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 2a10 10 0 00-10 10c0 3.54 2.29 6.53 5.47 7.59.4.09.55-.21.55-.47v-1.88c-2.23.49-2.7-1.06-2.7-1.06-.36-.92-1.48-.93-1.48-.93-1.21-.08.09-.09.09-.09.09 1.27.09 1.94 1.3 1.94 1.3 1.2 1.92 2.94 1.37 3.66 1.05.14-.82.54-1.38.89-1.7-.77-.15-1.58-.29-1.58-.29-1.29-.88.1-.86.1-.86 1.05.07 1.68 1.13 1.68 1.13 1.36 1.73 2.61 1.23 3.25.94.09-.73.35-1.23.53-1.51-2.56-.29-5.25-1.28-5.25-6.41 0-1.42.36-2.58 1-3.57-.1-.35-.44-1.76.01-3.67 0-0 1.13-.36 3.7 1.34a9.765 9.765 0 013.42-.44c1.26-.05 2.54.11 3.7.13.39-1.97.04-3.99-.01-4.47-1.13-.42-2.33-.71-3.78-.71-.95 0-1.88.26-2.63.68"/>
          </svg>
          <span className="ml-3">Subscription</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500">
          © 2026 StudySpace. All rights reserved.
        </p>
      </div>
    </aside>
  );
};