import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/boards/:id
router.get("/:id", async(req, res)=>{
    try {
        const {id} = req.params;
    
        const board = await prisma.board.findUnique({
            where : {id},
            include: {
                columns: {
                    include: {
                        cards: {
                            orderBy: {position: "asc"}
                        }
                    },
                    orderBy: {position:"asc"}
                }
            }
        });

        if(!board){
            return res.status(404).json({error: "Board not found"});
        }

        res.json(board);
    }
    catch(err){
        console.error("Error fetching board: ", err);
        return res.status(500).json({error: "Internal server error"});
    }
});

// POST /api/boards
router.post("/", async(req, res)=>{
    try{
        const {name} = req.body;

        if(!name){
            return res.status(400).json({error: "Missing required field: name"});
        }
        const board = await prisma.board.create({
            data: {name}
        });
        res.status(201).json(board);
    }
    catch(error){
        console.error('Error creating board:', error);
        res.status(500).json({error: "Internal server error"});
    }
});

//PATCH /api/boards/:id
router.patch("/:id", async(req, res)=>{
    try{
        const {id} = req.params;
        const {name} = req.body;
        if(!name){
            return res.status(400).json({error: "Missing required field: name"});
        }
        const updatedBoard = await prisma.board.update({
            where: { id },
            data: { name },
        });
        res.json(updatedBoard);
    }
    catch(error: any){
        console.error('Error updating board:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

// DELETE /api/boards/:id
router.delete("/:id", async(req, res)=>{
    try{
        const {id} = req.params;
        await prisma.board.delete({
            where: {id}
        });
        res.status(204).send();
    }
    catch(error: any){
        console.error('Error deleting board:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.status(500).json({error: "Internal server error"});
    }
});

export default router;