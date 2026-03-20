import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/edusphere',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10), // 500MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  marketplace: {
    serviceFeePercentage: parseInt(process.env.SERVICE_FEE_PERCENTAGE || '5', 10),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'edusphere/videos',
  },

  daily: {
    apiKey: process.env.DAILY_API_KEY || '',
    apiBaseUrl: 'https://api.daily.co/v1',
  },

  email: {
    /**
     * Leave SMTP_HOST empty → dev mode uses Ethereal (auto-creates a fake
     * inbox at https://ethereal.email so you can preview emails without
     * sending real ones — completely free, no sign-up needed).
     *
     * For production set:
     *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587
     *   SMTP_USER=you@gmail.com   SMTP_PASS=<gmail-app-password>
     */
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'EduSphere <no-reply@edusphere.dev>',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
} as const;

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTest = config.env === 'test';
