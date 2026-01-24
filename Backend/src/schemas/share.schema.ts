import { z } from 'zod';

export const shareBoardSchema = z.object({
  email: z.email('Invalid email address'),
  role: z.enum(['EDITOR', 'VIEWER'], {
    error: () => ({ message: 'Role must be EDITOR or VIEWER' })
  })
});

export const updateRoleSchema = z.object({
  role: z.enum(['EDITOR', 'VIEWER'], {
    error: () => ({ message: 'Role must be EDITOR or VIEWER' })
  })
});

export type ShareBoardInput = z.infer<typeof shareBoardSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;