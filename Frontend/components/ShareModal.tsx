"use client"

import { useState } from 'react';
import { useSharing } from '@/hooks/useSharing';
import { BoardRole } from '@/types/share';

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
        return 'bg-purple-100 text-purple-800';
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Share Board</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} className="mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 border p-2 rounded"
              disabled={shareBoardMutation.isPending}
            />
            
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
              className="border p-2 rounded"
              disabled={shareBoardMutation.isPending}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={shareBoardMutation.isPending || !email.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {shareBoardMutation.isPending ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>

        {/* Collaborators List */}
        <div>
          <h3 className="font-semibold mb-3">People with access</h3>
          
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
                  <div className="flex-1">
                    <div className="font-medium">{access.user.name}</div>
                    <div className="text-sm text-gray-600">{access.user.email}</div>
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
                          className="border p-1 rounded text-sm"
                          disabled={updateRoleMutation.isPending}
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>

                        <button
                          onClick={() => handleRemove(access.userId)}
                          disabled={removeCollaboratorMutation.isPending}
                          className="text-red-600 hover:text-red-800 text-sm px-2"
                        >
                          Remove
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