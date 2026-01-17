import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createCardSchema, updateCardSchema, reorderCardsSchema, ReorderCardsInput } from '../schemas/card.schema.js';

const router = express.Router();

// POST /api/cards
router.post("/", validateSchema(createCardSchema), asyncHandler(async (req, res)=>{
    const {columnId, title, description, position} = req.body;

    const card = await prisma.card.create({
        data: {
            columnId,
            title,
            description: description || "",
            position
        }
    });

    res.status(201).json(card);
}));

//PATCH /api/cards/:id
router.patch("/:id", validateSchema(updateCardSchema), asyncHandler(async (req, res)=>{
    const id = req.params.id as string;
    const {title, description, position, columnId} = req.body;
    
    const updatedCard = await prisma.card.update({
        where: { id },
        data: {title, description, position, columnId},
    });

    res.json(updatedCard);
}));

// DELETE /api/cards/:id
router.delete("/:id", asyncHandler(async (req, res)=>{
    const id = req.params.id as string;
    await prisma.card.delete({
        where: {id}
    });

    res.status(204).end();
}));

// POST /api/cards/reorder
router.post('/reorder', validateSchema(reorderCardsSchema), asyncHandler(async (req, res) => {
    const { columns } = req.body as ReorderCardsInput;

    await prisma.$transaction(
        columns.flatMap(column =>
        column.cards.map(card =>
            prisma.card.update({
            where: { 
                id: card.id,
            },
            data: { 
                position: card.position,
                columnId: column.columnId
            }
            })
        )
        )
    );

    res.json({ success: true });
}));

export default router;