import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config, isDevelopment } from './config/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { logger } from './shared/utils/logger.js';

// Import routes (will be created)
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import courseRoutes from './modules/courses/course.routes.js';
import enrollmentRoutes from './modules/enrollments/enrollment.routes.js';
import videoRoutes from './modules/videos/video.routes.js';
import documentRoutes from './modules/documents/document.routes.js';
import marketplaceRoutes from './modules/marketplace/marketplace.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import liveSessionRoutes from './modules/live-sessions/live-session.routes.js';
import { paymentController } from './modules/payments/payment.controller.js';

const app: Application = express();
const apiPrefix = `/api/${config.apiVersion}`;

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Stripe webhook must receive raw body for signature verification.
app.post(
  `${apiPrefix}/payments/webhook`,
  express.raw({ type: 'application/json' }),
  (req, res, next) => paymentController.handleWebhook(req, res, next)
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/courses`, courseRoutes);
app.use(`${apiPrefix}/enrollments`, enrollmentRoutes);
app.use(`${apiPrefix}/videos`, videoRoutes);
app.use(`${apiPrefix}/documents`, documentRoutes);
app.use(`${apiPrefix}/marketplace`, marketplaceRoutes);
app.use(`${apiPrefix}/cart`, cartRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/live-sessions`, liveSessionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
