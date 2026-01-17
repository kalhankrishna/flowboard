import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema, ReorderColumnsInput } from '../schemas/column.schema.js';

const router = express.Router();

// POST /api/columns
router.post("/", validateSchema(createColumnSchema), asyncHandler(async(req, res)=>{
    const {boardId, title, position} = req.body;

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
router.patch("/:id", validateSchema(updateColumnSchema), asyncHandler(async(req, res)=>{
    const id = req.params.id as string;
    const {title, position} = req.body;
    
    const updatedColumn = await prisma.column.update({
        where: { id },
        data: {title, position},
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
router.post('/reorder', validateSchema(reorderColumnsSchema), asyncHandler(async (req, res) => {
    const { columns } = req.body as ReorderColumnsInput;

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