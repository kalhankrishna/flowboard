import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

interface ReorderCardsRequest {
  columns: Array<{
    columnId: string;
    cards: Array<{
      id: string;
      position: number;
    }>;
  }>;
}

const router = express.Router();

// POST /api/cards
router.post("/", asyncHandler(async (req, res)=>{
    const {columnId, title, description, position} = req.body;

    if(!columnId || !title || position === undefined){
        return res.status(400).json({error: "Missing required fields: columnId, title, position"});
    }

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
router.patch("/:id", asyncHandler(async (req, res)=>{
    const id = req.params.id as string;
    const {title, description, position, columnId} = req.body;

    const updatedData = Object.fromEntries(
        Object.entries({title, description, position, columnId})
        .filter(([_, value]) => value !== undefined)
    );
    
    const updatedCard = await prisma.card.update({
        where: { id },
        data: updatedData,
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
router.post('/reorder', asyncHandler(async (req, res) => {
    const { columns } = req.body as ReorderCardsRequest;

    if (!Array.isArray(columns)) {
        return res.status(400).json({ error: 'columns must be an array' });
    }

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