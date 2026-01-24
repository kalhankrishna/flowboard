import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createBoardSchema, updateBoardSchema } from '../schemas/board.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getRoleByBoardId, hasSufficientRole } from '../lib/permission.helper.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/boards
router.get("/", asyncHandler(async (req, res)=>{
  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const ownedBoards = await prisma.board.findMany({
    where: { ownerId: req.user.id },
    orderBy: {createdAt: "asc"},
    include: {
      _count: {
        select: { columns: true }
      }
    }
  });

  const sharedBoards = await prisma.boardAccess.findMany({
    where: { 
      userId: req.user.id,
      role: { not: "OWNER" }
    },
    orderBy: { board: { createdAt: "asc" } },
    include: {
      board: {
        include: {
          _count: {
            select: { columns: true }
          }
        }
      }
    }
  });

  res.json({ ownedBoards, sharedBoards: sharedBoards.map(sb => sb.board) });
}));


// GET /api/boards/:id
router.get("/:id", asyncHandler(async(req, res)=>{
  const id = req.params.id as string;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(id, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "VIEWER")) {
    return res.status(403).json({ error: "Not authorized to access this board" });
  }

  const board = await prisma.board.findFirst({
    where: { 
      id
    },
    include: {
      columns: {
        include: {
          cards: {
            orderBy: { position: "asc" }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });

  res.json(board);
}));

// POST /api/boards
router.post("/", validateSchema(createBoardSchema), asyncHandler(async (req, res) => {
  const { name } = req.body;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  const userId = req.user.id;

  const board = await prisma.$transaction(async (tx)=>{
    const newBoard = await tx.board.create({
      data: { 
        name,
        ownerId: userId
      }
    });

    await tx.boardAccess.create({
      data: {
        boardId: newBoard.id,
        userId,
        role: 'OWNER'
      }
    });

    return newBoard;
  });
  
  res.status(201).json(board);
}));

//PATCH /api/boards/:id
router.patch("/:id", validateSchema(updateBoardSchema), asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const { name } = req.body;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(id, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "OWNER")) {
    return res.status(403).json({ error: "Not authorized to modify this board" });
  }

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  const updatedBoard = await prisma.board.update({
    where: { id },
    data: { name },
  });

  res.json(updatedBoard);
}));

// DELETE /api/boards/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = req.params.id as string;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(id, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "OWNER")) {
    return res.status(403).json({ error: "Not authorized to modify this board" });
  }

  await prisma.board.delete({
    where: { id }
  });

  res.status(204).send();
}));

export default router;