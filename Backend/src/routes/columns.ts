import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema, ReorderColumnsInput } from '../schemas/column.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getRoleByBoardId, getRoleByColumnId, hasSufficientRole } from '../lib/permission.helper.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/columns
router.post("/", validateSchema(createColumnSchema), asyncHandler(async(req, res)=>{
    const {boardId, title, position} = req.body;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByBoardId(boardId, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to add columns to this board" });
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

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(id, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to edit columns in this board" });
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

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(id, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to delete columns from this board" });
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

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(columns[0].id, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to reorder columns in this board" });
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