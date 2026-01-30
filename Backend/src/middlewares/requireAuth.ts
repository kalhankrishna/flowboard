import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth.js';
import { asyncHandler } from './asyncHandler.js';
import { prisma } from '../lib/prisma.js';

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;

    next();
});