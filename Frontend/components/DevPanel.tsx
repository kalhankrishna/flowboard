'use client';

import { useAuthStore } from '@/store';
import { useSocketStore } from '@/store';

export default function DevPanel() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { status, setConnected, setDisconnected } = useSocketStore();
  
  const handleTestLogin = () => {
    login(
      { id: '123', email: 'test@example.com', name: 'Test User' },
      'fake-jwt-token'
    );
  };
  
  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Dev Panel (Delete Me)</h3>

      <div className="mb-4">
        <p className="text-sm font-semibold">Auth Store:</p>
        <p className="text-xs">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p className="text-xs">User: {user?.email || 'None'}</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleTestLogin}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Test Login
          </button>
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Logout
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Socket Store:</p>
        <p className="text-xs">Status: {status}</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={setConnected}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Connect
          </button>
          <button 
            onClick={() => setDisconnected('Test error')}
            className="bg-orange-500 text-white px-2 py-1 rounded text-xs"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}