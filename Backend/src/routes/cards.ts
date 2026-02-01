import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createCardSchema, updateCardSchema, reorderCardsSchema } from '../schemas/card.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getRoleByCardId, getRoleByColumnId, hasSufficientRole } from '../lib/permission.helper.js';
import { getNewPos, needsRebalancing, rebalance } from '../lib/position.helper.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/cards
router.post("/", asyncHandler(async (req, res)=>{
    const reqData = createCardSchema.parse(req.body);
    const {columnId, title, description, position} = reqData;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(columnId, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to add cards to this board" });
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
    const reqData = updateCardSchema.parse(req.body);
    const {title, description, position, columnId} = reqData;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByCardId(id, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to edit cards in this board" });
    }
    
    const updatedCard = await prisma.card.update({
        where: { id },
        data: {title, description : description || "", position, columnId},
    });

    res.json(updatedCard);
}));

// DELETE /api/cards/:id
router.delete("/:id", asyncHandler(async (req, res)=>{
    const id = req.params.id as string;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByCardId(id, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to delete cards in this board" });
    }

    await prisma.card.delete({
        where: {id}
    });

    res.status(204).end();
}));

//POST api/cards/reorder
router.post('/reorder', asyncHandler(async (req, res) => {
    const reqData = reorderCardsSchema.parse(req.body);
    const {cardId, prevCardId, nextCardId, columnId} = reqData;

    if(!req.user){
        return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = await getRoleByColumnId(columnId, req.user.id);
    if (!userRole || !hasSufficientRole(userRole, "EDITOR")) {
        return res.status(403).json({ error: "Not authorized to reorder cards in this board" });
    }

    const allCardsInColumn = await prisma.card.findMany({
        where: { columnId },
        orderBy: { position: 'asc' },
        select: { id: true, position: true }
    });

    if (prevCardId && !allCardsInColumn.find(c => c.id === prevCardId)) {
        return res.status(400).json({ 
            error: 'Previous card reference not found in target column'
        });
    }

    if (nextCardId && !allCardsInColumn.find(c => c.id === nextCardId)) {
        return res.status(400).json({ 
            error: 'Next card reference not found in target column'
        });
    }

    const cardsToCheck = allCardsInColumn.filter(c => c.id !== cardId);

    if(needsRebalancing(cardsToCheck)){
        const rebalancedCards = rebalance(cardsToCheck);

        const prevCardPos = prevCardId ? rebalancedCards.find(c => c.id === prevCardId)?.position : undefined;
        const nextCardPos = nextCardId ? rebalancedCards.find(c => c.id === nextCardId)?.position : undefined;
        const newPos = getNewPos(prevCardPos, nextCardPos);

        await prisma.$transaction([
            ...rebalancedCards.map(card =>
                prisma.card.update({
                    where: { id: card.id },
                    data: { position: card.position }
                })
            ),
            prisma.card.update({
                where: { id: cardId },
                data: { position: newPos, columnId }
            })
        ]);

        res.json({ success: true });
        return;
    }
    
    const prevCardPos = prevCardId ? allCardsInColumn.find(c => c.id === prevCardId)?.position : undefined;
    const nextCardPos = nextCardId ? allCardsInColumn.find(c => c.id === nextCardId)?.position : undefined;
    const newPos = getNewPos(prevCardPos, nextCardPos);

    await prisma.card.update({
        where: { id: cardId },
        data: { position: newPos, columnId }
    });

    res.json({ success: true });
}));

export default router;