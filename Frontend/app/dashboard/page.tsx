'use client';

import Link from 'next/link';

export default function DashboardPage() {
  // Hardcoded for now - we'll replace with API call in FB-022.11
  const hardcodedBoardId = 'a770b5dc-8537-49fe-869d-7a0908f9b2d0';
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Boards</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Create Board
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hardcoded single board for now */}
        <Link 
          href={`/dashboard/boards/${hardcodedBoardId}`}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">My Kanban Board</h2>
          <p className="text-gray-600 text-sm">Click to open</p>
        </Link>
      </div>
    </div>
  );
}