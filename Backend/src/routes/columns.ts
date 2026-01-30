import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema } from '../schemas/column.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getRoleByBoardId, getRoleByColumnId, hasSufficientRole } from '../lib/permission.helper.js';
import { getNewPos, needsRebalancing, rebalance } from '../lib/position.helper.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/columns
router.post("/", asyncHandler(async(req, res)=>{
    const reqData = createColumnSchema.parse(req.body);
    const {boardId, title, position} = reqData;

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
router.patch("/:id", asyncHandler(async(req, res)=>{
    const id = req.params.id as string;
    const reqData = updateColumnSchema.parse(req.body);
    const {title, position} = reqData;

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
router.post('/reorder', asyncHandler(async (req, res) => {
    const reqData = reorderColumnsSchema.parse(req.body);
    const {columnId, prevColumnId, nextColumnId, boardId} = reqData;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(columnId, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to reorder columns in this board" });
    }

    const allColumnsInBoard = await prisma.column.findMany({
        where: { boardId },
        orderBy: { position: 'asc' }
    });

    const columnsToCheck = allColumnsInBoard.filter(c => c.id !== columnId);

    if(needsRebalancing(columnsToCheck)){
        const rebalancedColumns = rebalance(columnsToCheck);

        const prevColumnPos = prevColumnId ? rebalancedColumns.find(c => c.id === prevColumnId)?.position : undefined;
        const nextColumnPos = nextColumnId ? rebalancedColumns.find(c => c.id === nextColumnId)?.position : undefined;
        const newPos = getNewPos(prevColumnPos, nextColumnPos);

        const updatedColumns = [...rebalancedColumns, { id: columnId, position: newPos }];

        await prisma.$transaction(
            updatedColumns.map(column =>
                prisma.column.update({
                    where: { id: column.id },
                    data: { position: column.position }
                })
            )
        );

        res.json({ success: true });
        return;
    }
    
    const prevColumnPos = prevColumnId ? allColumnsInBoard.find(c => c.id === prevColumnId)?.position : undefined;
    const nextColumnPos = nextColumnId ? allColumnsInBoard.find(c => c.id === nextColumnId)?.position : undefined;
    const newPos = getNewPos(prevColumnPos, nextColumnPos);

    await prisma.column.update({
        where: { id: columnId },
        data: { position: newPos }
    });

    res.json({ success: true });
}));

export default router;