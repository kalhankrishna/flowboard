import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const createColumnSchema = z.object({
  boardId: z.uuid('Invalid board ID'),
  title: z.string().min(1, 'Column title is required').max(100, 'Column title too long'),
  position: z.string().transform(val => new Prisma.Decimal(val)),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(100, 'Column title too long').optional(),
  position: z.string().transform(val => new Prisma.Decimal(val)).optional(),
}).refine(data => data.title !== undefined || data.position !== undefined, {
  message: 'At least one field (title or position) must be provided',
});

export const reorderColumnsSchema = z.object({
  columnId: z.uuid('Invalid column ID'),
  prevColumnId: z.uuid('Invalid prevColumnId').nullable(),
  nextColumnId: z.uuid('Invalid nextColumnId').nullable(),
  boardId: z.uuid('Invalid board ID'),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;