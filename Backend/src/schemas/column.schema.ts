import { z } from 'zod';

export const createColumnSchema = z.object({
  boardId: z.uuid('Invalid board ID'),
  title: z.string().min(1, 'Column title is required').max(100, 'Column title too long'),
  position: z.number().int().nonnegative('Position must be non-negative'),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(100, 'Column title too long').optional(),
  position: z.number().int().nonnegative('Position must be non-negative').optional(),
}).refine(data => data.title !== undefined || data.position !== undefined, {
  message: 'At least one field (title or position) must be provided',
});

export const reorderColumnsSchema = z.object({
  columns: z.array(
    z.object({
      id: z.uuid('Invalid column ID'),
      position: z.number().int().nonnegative('Position must be non-negative'),
    })
  ),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;