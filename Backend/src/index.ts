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

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
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

//Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});