import { z } from 'zod';

export const createCardSchema = z.object({
  columnId: z.uuid('Invalid column ID'),
  title: z.string().min(1, 'Card title is required').max(200, 'Card title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  position: z.number().int().nonnegative('Position must be non-negative'),
});

export const updateCardSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(200, 'Card title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  position: z.number().int().nonnegative('Position must be non-negative').optional(),
  columnId: z.uuid('Invalid column ID').optional(),
}).refine(
  data => data.title !== undefined || data.description !== undefined || data.position !== undefined || data.columnId !== undefined,
  { message: 'At least one field must be provided' }
);

export const reorderCardsSchema = z.object({
  columns: z.array(
    z.object({
      columnId: z.uuid('Invalid column ID'),
      cards: z.array(
        z.object({
          id: z.uuid('Invalid card ID'),
          position: z.number().int().nonnegative('Position must be non-negative'),
        })
      ),
    })
  ),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>;