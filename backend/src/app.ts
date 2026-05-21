import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler, AppError } from './middleware/error.middleware';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// API Prefix Routing
app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Alex Gigs API is running smoothly',
    timestamp: new Date()
  });
});

// Fallback 404 Route
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
