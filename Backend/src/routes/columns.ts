import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

interface ReorderColumnsRequest {
  columns: Array<{
    id: string;
    position: number;
  }>;
}

const router = express.Router();

// POST /api/columns
router.post("/", asyncHandler(async(req, res)=>{
    const {boardId, title, position} = req.body;

    if(!boardId || !title || position === undefined){
        return res.status(400).json({error: "Missing required fields: boardId, title, position"});
    }

    const column = await prisma.column.create({
        data: {
            boardId,
            title,
            position
        }
    });

    res.status(201).json(column);
}));

// PATCH /api/columns/:id
router.patch("/:id", asyncHandler(async(req, res)=>{
    const id = req.params.id as string;
    const {title, position} = req.body;
    const updatedData = Object.fromEntries(
        Object.entries({title, position})
        .filter(([_, value]) => value !== undefined)
    );
    
    const updatedColumn = await prisma.column.update({
        where: { id },
        data: updatedData,
    });

    res.json(updatedColumn);
}));

// DELETE /api/columns/:id
router.delete("/:id", asyncHandler(async(req, res)=>{
    const id = req.params.id as string;
    
    await prisma.column.delete({
        where: {id}
    });

    res.status(204).send();
}));

// POST /api/columns/reorder
router.post('/reorder', asyncHandler(async (req, res) => {
    const { columns } = req.body as ReorderColumnsRequest;

    if (!Array.isArray(columns)) {
        return res.status(400).json({ error: 'columns must be an array' });
    }

    await prisma.$transaction(
        columns.map(column =>
        prisma.column.update({
            where: { id: column.id },
            data: { position: column.position }
        })
        )
    );

    res.json({ success: true });
}));

export default router;