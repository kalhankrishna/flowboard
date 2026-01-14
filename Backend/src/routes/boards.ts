import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const Prisma = new PrismaClient();

// GET /api/boards/:id
router.get("/:id", async(req, res)=>{
    try {
        const {id} = req.params;
    
        const board = await Prisma.board.findUnique({
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

export default router;