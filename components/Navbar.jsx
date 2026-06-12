'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <span className="text-xl font-bold text-green-600 hidden sm:block">Campus Dashboard</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-6 h-full">
          <Link 
            href="/" 
            className={`font-medium h-full flex items-center border-b-2 transition-colors ${pathname === '/' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Home
          </Link>
          <Link 
            href="/search" 
            className={`font-medium h-full flex items-center border-b-2 transition-colors ${pathname === '/search' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Search
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden md:block">{session?.user?.username || session?.user?.email}</span>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}