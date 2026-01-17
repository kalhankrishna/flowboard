import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name too long'),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name too long'),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;