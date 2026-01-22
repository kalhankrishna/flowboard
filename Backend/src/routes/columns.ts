import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema, ReorderColumnsInput } from '../schemas/column.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();
router.use(requireAuth);

// Helper --> verify board ownership
async function verifyBoardOwnership(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId }
  });

  return !!board;
}

// POST /api/columns
router.post("/", validateSchema(createColumnSchema), asyncHandler(async(req, res)=>{
    const {boardId, title, position} = req.body;

    const hasAccess = await verifyBoardOwnership(boardId, req.user!.id);
  
    if (!hasAccess) {
        return res.status(403).json({ error: "Not authorized" });
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
router.patch("/:id", validateSchema(updateColumnSchema), asyncHandler(async(req, res)=>{
    const id = req.params.id as string;
    const {title, position} = req.body;

    const column = await prisma.column.findUnique({
        where: { id },
        include: { board: true }
    });

    if (!column || column.board.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
    }
    
    const updatedColumn = await prisma.column.update({
        where: { id },
        data: {title, position},
    });

    res.json(updatedColumn);
}));

// DELETE /api/columns/:id
router.delete("/:id", asyncHandler(async(req, res)=>{
    const id = req.params.id as string;

    const column = await prisma.column.findUnique({
        where: { id },
        include: { board: true }
    });

    if (!column || column.board.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
    }
    
    await prisma.column.delete({
        where: {id}
    });

    res.status(204).send();
}));

// POST /api/columns/reorder
router.post('/reorder', validateSchema(reorderColumnsSchema), asyncHandler(async (req, res) => {
    const { columns } = req.body as ReorderColumnsInput;

    if (columns.length === 0) {
        return res.json({ success: true });
    }

    const firstColumn = await prisma.column.findUnique({
        where: { id: columns[0].id },
        include: { board: true }
    });

    if (!firstColumn || firstColumn.board.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
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