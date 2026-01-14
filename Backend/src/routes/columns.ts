import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/columns
router.post("/", async(req, res)=>{
    try{
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
    }
    catch(error){
        console.error('Error creating column:', error);
        res.status(500).json({error: "Internal server error"});
    }
});

// PATCH /api/columns/:id
router.patch("/:id", async(req, res)=>{
    try{
        const {id} = req.params;
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
    }catch(error: any){
        console.error('Error updating column:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Column not found' });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

// DELETE /api/columns/:id
router.delete("/:id", async(req, res)=>{
    try{
        const {id} = req.params;
        
        await prisma.column.delete({
            where: {id}
        });

        res.status(204).send();
    }
    catch(error: any){
        console.error('Error deleting column:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Column not found' });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

export default router;