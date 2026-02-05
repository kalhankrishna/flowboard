import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import boardRoutes from './routes/boards.js';
import cardRoutes from './routes/cards.js';
import columnRoutes from './routes/columns.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { validateEnv } from './config/env.js';
import { authSocketMiddleware } from './webSockets/auth.middleware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerBoardHandlers } from './webSockets/boardHandlers.js';
import { registerLockHandlers } from './webSockets/lockHandlers.js';
import { registerUpdateHandlers } from './webSockets/updateHandlers.js';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

io.use(authSocketMiddleware);

io.on('connection', (socket) => {
  registerBoardHandlers(io, socket);
  registerLockHandlers(io, socket);
  registerUpdateHandlers(io, socket);
});

app.locals.io = io;

// Express

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FlowBoard API is running' });
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/columns', columnRoutes);

//Error handler
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready for connections`);
});