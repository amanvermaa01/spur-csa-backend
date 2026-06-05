import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development flexibility, can lock down to frontend origin later
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);


// Unmatched route handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
