import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const createCardSchema = z.object({
  columnId: z.uuid('Invalid column ID'),
  title: z.string().min(1, 'Card title is required').max(200, 'Card title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  position: z.string().transform(val => new Prisma.Decimal(val)),
});

export const updateCardSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(200, 'Card title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  position: z.string().transform(val => new Prisma.Decimal(val)).optional(),
  columnId: z.uuid('Invalid column ID').optional(),
}).refine(
  data => data.title !== undefined || data.description !== undefined || data.position !== undefined || data.columnId !== undefined,
  { message: 'At least one field must be provided' }
);

export const reorderCardsSchema = z.object({
  cardId: z.uuid('Invalid card ID'),
  prevCardId: z.uuid('Invalid prevCardId').optional(),
  nextCardId: z.uuid('Invalid nextCardId').optional(),
  columnId: z.uuid('Invalid column ID'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>;