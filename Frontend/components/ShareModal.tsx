"use client"

import { useState } from 'react';
import { useSharing } from '@/hooks/useSharing';
import { BoardRole } from '@/types/share';
import { X, Share2, Trash2 } from 'lucide-react';

export default function ShareModal({
  boardId,
  onClose,
}: {
  boardId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');

  const {
    getCollaboratorsQuery,
    shareBoardMutation,
    updateRoleMutation,
    removeCollaboratorMutation,
  } = useSharing(boardId);

  const { data: collaborators, isLoading } = getCollaboratorsQuery;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    shareBoardMutation.mutate(
      { email: email.trim(), role },
      {
        onSuccess: () => {
          setEmail('');
          setRole('EDITOR');
        },
      }
    );
  };

  const handleRoleChange = (userId: string, newRole: 'EDITOR' | 'VIEWER') => {
    updateRoleMutation.mutate({ userId, role: { role: newRole } });
  };

  const handleRemove = (userId: string) => {
    if (window.confirm('Remove this collaborator?')) {
      removeCollaboratorMutation.mutate(userId);
    }
  };

  const getRoleBadgeColor = (role: BoardRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-cyan-100 text-cyan-800';
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stringToHex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const minHue = 170;
    const maxHue = 220;
    const hueRange = maxHue - minHue;
    
    const hue = minHue + (Math.abs(hash) % hueRange);
    
    return `hsl(${hue}, 65%, 55%)`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-gray-700 font-heading font-semibold">Share Board</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer transition"
          >
            <X className='size-6'/>
          </button>
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} className="mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@example.com"
              className="border border-gray-300 text-gray-700 p-2 w-full rounded focus:outline-0 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-300 transition"
              disabled={shareBoardMutation.isPending}
              autoFocus
            />
            
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
              className="border text-cyan-500 p-2 rounded-lg hover:text-cyan-600 hover:cursor-pointer focus:outline-0 transition"
              disabled={shareBoardMutation.isPending}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={shareBoardMutation.isPending || !email.trim()}
              className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 hover:cursor-pointer disabled:opacity-50 focus:outline-0 transition"
            >
              <span className='inline-block'>
                <Share2 className='size-4' />
              </span>
              {shareBoardMutation.isPending ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>

        {/* Collaborators List */}
        <div>
          <h3 className="text-gray-700 font-semibold font-heading mb-3">People with access</h3>
          
          {isLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : !collaborators || collaborators.length === 0 ? (
            <div className="text-gray-600">No collaborators yet</div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className='flex items-center justify-center gap-2'>
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium hover:cursor-default"
                      style={{ backgroundColor: stringToHex(access.user.name) }}
                    >
                      {access.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-700 font-medium">{access.user.name}</div>
                      <div className="text-sm text-gray-500">{access.user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {access.role === 'OWNER' ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(access.role)}`}>
                        Owner
                      </span>
                    ) : (
                      <>
                        <select
                          value={access.role}
                          onChange={(e) => handleRoleChange(access.userId, e.target.value as 'EDITOR' | 'VIEWER')}
                          className="border text-sm text-cyan-500 p-2 rounded-lg hover:text-cyan-600 hover:cursor-pointer focus:outline-0 transition"
                          disabled={updateRoleMutation.isPending}
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>

                        <button
                          onClick={() => handleRemove(access.userId)}
                          disabled={removeCollaboratorMutation.isPending}
                          className="text-red-400 rounded-lg hover:bg-red-200 hover:cursor-pointer p-2"
                        >
                          <Trash2 className='size-5' />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}