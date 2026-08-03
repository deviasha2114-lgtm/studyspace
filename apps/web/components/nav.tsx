import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Nav = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        <Link
          href="/dashboard"
          className={`${pathname === '/dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                     inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
        >
          Dashboard
        </Link>
        <Link
          href="/study-rooms"
          className={`${pathname.startsWith('/study-rooms') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                     inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
        >
          Study Rooms
        </Link>
        <Link
          href="/clubs"
          className={`${pathname.startsWith('/clubs') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                     inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
        >
          Clubs
        </Link>
        <Link
          href="/resources"
          className={`${pathname.startsWith('/resources') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                     inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
        >
          Resources
        </Link>
        <Link
          href="/messages"
          className={`${pathname.startsWith('/messages') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                     inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
        >
          Messages
        </Link>
      </div>
    </div>
  );
};