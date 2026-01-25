export type BoardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface BoardAccess {
  id: string;
  userId: string;
  boardId: string;
  role: BoardRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ShareBoardInput {
  email: string;
  role: 'EDITOR' | 'VIEWER';
}

export interface UpdateRoleInput {
  role: 'EDITOR' | 'VIEWER';
}