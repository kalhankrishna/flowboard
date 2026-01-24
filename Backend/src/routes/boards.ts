import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createBoardSchema, updateBoardSchema } from '../schemas/board.schema.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getRoleByBoardId, hasSufficientRole } from '../lib/permission.helper.js';
import { shareBoardSchema, updateRoleSchema } from '../schemas/share.schema.js';

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
router.delete("/:id", validateSchema(shareBoardSchema), asyncHandler(async (req, res) => {
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

//POST /api/boards/:id/share
router.post("/:id/share", asyncHandler(async(req,res)=>{
  const boardId = req.params.id as string;
  const {email, role} = req.body;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(boardId, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "OWNER")) {
    return res.status(403).json({ error: "Not authorized to share this board" });
  }

  const userToShare = await prisma.user.findUnique({
    where: { email }
  });

  if (!userToShare) {
    return res.status(404).json({ error: "Collaborator not found" });
  }
  if (userToShare.id === req.user.id) {
    return res.status(400).json({ error: "Cannot share board with yourself" });
  }

  const result = await prisma.boardAccess.upsert({
    where: {
      boardId_userId: {
        boardId,
        userId: userToShare.id
      }
    },

    update: { role },
    create: {
      boardId,
      userId: userToShare.id,
      role
    }
  });

  const accesswithUser = await prisma.boardAccess.findUnique({
    where: {id: result.id},
    include: {
      user: {
        select: {id: true, email: true, name: true}
      }
    }
  });

  res.status(201).json(accesswithUser);
}));

//GET /api/boards/:id/access
router.get("/:id/access", asyncHandler(async(req,res)=>{
  const boardId = req.params.id as string;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(boardId, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "VIEWER")) {
    return res.status(403).json({ error: "Not authorized to view access list for this board" });
  }

  const collaborators = await prisma.boardAccess.findMany({
    where: { boardId },
    include: {
      user: {
        select: {id: true, email: true, name: true}
      }
    },
    orderBy: { createdAt: "asc" }
  });

  res.json(collaborators);
}));

//PATCH /api/boards/:id/access/:userId
router.patch("/:id/access/:userId", validateSchema(updateRoleSchema), asyncHandler(async(req,res)=>{
  const boardId = req.params.id as string;
  const userIdToUpdate = req.params.userId as string;
  const {role} = req.body;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(boardId, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "OWNER")) {
    return res.status(403).json({ error: "Not authorized to update access for this board" });
  }

  if (userIdToUpdate === req.user.id) {
    return res.status(400).json({ error: "Cannot change your own role" });
  }

  const existingAccess = await prisma.boardAccess.findUnique({
    where: {
      boardId_userId: { boardId, userId: userIdToUpdate }
    }
  });

  if (!existingAccess) {
    return res.status(404).json({ error: "Collaborator not found" });
  }

  const result = await prisma.boardAccess.update({
    where: {
      boardId_userId: {
        boardId,
        userId: userIdToUpdate
      }
    },
    data: { role }
  });

  const updatedAccessWithUser = await prisma.boardAccess.findUnique({
    where: {id: result.id},
    include: {
      user: {
        select: {id: true, email: true, name: true}
      }
    }
  });

  res.json(updatedAccessWithUser);
}));

//DELETE /api/boards/:id/access/:userId
router.delete("/:id/access/:userId", asyncHandler(async(req,res)=>{
  const boardId = req.params.id as string;
  const userIdToDelete = req.params.userId as string;

  if(!req.user){
    return res.status(401).json({ error: "Authentication required" });
  }

  const userRole = await getRoleByBoardId(boardId, req.user.id);
  if (!userRole || !hasSufficientRole(userRole, "OWNER")) {
    return res.status(403).json({ error: "Not authorized to remove access for this board" });
  }

  if (userIdToDelete === req.user.id) {
    return res.status(400).json({ error: "Cannot remove yourself from the board" });
  }

  const existingAccess = await prisma.boardAccess.findUnique({
    where: {
      boardId_userId: { boardId, userId: userIdToDelete }
    }
  });

  if (!existingAccess) {
    return res.status(404).json({ error: "Collaborator not found" });
  }

  await prisma.boardAccess.delete({
    where: {
      boardId_userId: {
        boardId,
        userId: userIdToDelete
      }
    }
  });

  res.status(204).send();
}));

export default router;