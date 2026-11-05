import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socket.js';
import { isDBConnected } from './config/db.js';
import seedDemo from './utils/seedDemo.js';
import { errorHandler } from './middleware/error.js';

// Routes
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import customerRoutes from './routes/customers.js';
import knowledgeRoutes from './routes/knowledge.js';
import settingsRoutes from './routes/settings.js';
import webhookRoutes from './routes/webhooks.js';
import n8nRoutes from './routes/n8n.js';
import workflowRoutes from './routes/workflows.js';
import broadcastRoutes from './routes/broadcasts.js';
import teamRoutes from './routes/team.js';
import notificationRoutes from './routes/notifications.js';

// Load .env from repo root (works whether started from server/ or repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config(); // overlay with process env without overriding

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

app.set('io', io);

// Trust proxy (useful behind reverse proxies)
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach io to request for use in route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ReplyAI API',
    demoMode: process.env.DEMO_MODE === 'true',
    db: isDBConnected() ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Boot the HTTP server immediately; MongoDB connects in the background so the
// app is runnable even without a live database (in-memory demo store).
httpServer.listen(PORT, () => {
  console.log(`[ReplyAI] Server running on http://localhost:${PORT}`);
  console.log(`[ReplyAI] Demo mode: ${process.env.DEMO_MODE === 'true' ? 'ON' : 'off'}`);
  if (process.env.SEED_DEMO === 'true') {
    seedDemo().catch(console.error);
  }
});

connectDB().catch((err) => {
  console.warn('[ReplyAI] MongoDB background connection failed:', err.message);
});
