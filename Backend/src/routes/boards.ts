import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createBoardSchema, updateBoardSchema } from '../schemas/board.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/boards
router.get("/", asyncHandler(async (req, res)=>{
  const boards = await prisma.board.findMany({
    where: { ownerId: req.user?.id },
    orderBy: {createdAt: "asc"},
    include: {
      _count: {
        select: { columns: true }
      }
    }
  });

  res.json(boards);
}));


// GET /api/boards/:id
router.get("/:id", asyncHandler(async(req, res)=>{
  const id = req.params.id as string;

  const board = await prisma.board.findFirst({
    where: { 
      id,
      ownerId: req.user!.id
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

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  const board = await prisma.board.create({
    data: { 
      name,
      ownerId: req.user!.id
    }
  });
  
  res.status(201).json(board);
}));

//PATCH /api/boards/:id
router.patch("/:id", validateSchema(updateBoardSchema), asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  const board = await prisma.board.findFirst({
    where: { id, ownerId: req.user!.id }
  });

  if (!board) {
    return res.status(403).json({ error: "Not authorized to modify this board" });
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

  const board = await prisma.board.findFirst({
    where: { id, ownerId: req.user!.id }
  });

  if (!board) {
    return res.status(403).json({ error: "Not authorized to delete this board" });
  }

  await prisma.board.delete({
    where: { id }
  });

  res.status(204).send();
}));

export default router;