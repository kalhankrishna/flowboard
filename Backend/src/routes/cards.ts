import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const Prisma = new PrismaClient();

// POST /api/cards
router.post("/", async (req, res)=>{
    try{
        const {columnId, title, description, position} = req.body;

        if(!columnId || !title || position === undefined){
            return res.status(400).json({error: "Missing required fields: columnId, title, position"});
        }

        const card = await Prisma.card.create({
            data: {
                columnId,
                title,
                description: description || "",
                position
            }
        });

        res.status(201).json(card);
    }catch(error){
        console.error('Error creating card:', error);
        res.status(500).json({error: "Internal server error"});
    }
});

//PATCH /api/cards/:id
router.patch("/:id", async (req, res)=>{
    try{
        const {id} = req.params;
        const {title, description, position, columnId} = req.body;

        const updatedData = Object.fromEntries(
            Object.entries({title, description, position, columnId})
            .filter(([_, value]) => value !== undefined)
        );
        
        const updatedCard = await Prisma.card.update({
            where: { id },
            data: updatedData,
        });

        res.json(updatedCard);
    }catch(error: any){
        console.error('Error updating card:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

// DELETE /api/cards/:id
router.delete("/:id", async (req, res)=>{
    try{
        const {id} = req.params;
        await Prisma.card.delete({
            where: {id}
        });

        res.status(204).end();
    }catch(error: any){
        console.error('Error deleting card:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

export default router;