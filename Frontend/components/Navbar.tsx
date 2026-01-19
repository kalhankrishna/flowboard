'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              FlowBoard
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              My Boards
            </Link>
            
            {/* Placeholder for board switcher (Phase 4) */}
            <div className="text-gray-400 text-sm">
              Board Switcher (Coming Soon)
            </div>
            
            {/* Placeholder for user menu (Phase 3) */}
            <div className="text-gray-400 text-sm">
              User Menu (Coming Soon)
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}