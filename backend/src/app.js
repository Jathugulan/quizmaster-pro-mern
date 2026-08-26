import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { getDBStatus } from './config/database.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { sendSuccess } from './utils/response.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';


const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. CORS configuration - Localhost only
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', ENV.CLIENT_URL].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser agents (Postman, curl) or matching local frontend origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS origin blocked by QuizMaster security policy.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Logging
if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate limiting on all API routes
app.use('/api', generalLimiter);

// 6. Base / Health check endpoints
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  return sendSuccess(
    res,
    {
      status: 'healthy',
      database: dbStatus.isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      env: ENV.NODE_ENV,
    },
    'QuizMaster API is active and operational.'
  );
});

app.get('/api/health/db', (req, res) => {
  const dbStatus = getDBStatus();
  return sendSuccess(res, dbStatus, 'Database health status retrieved.');
});

// 7. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);


// 8. 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
