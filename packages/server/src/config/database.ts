import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../shared/utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  // TLS 1.2 is forced globally in bootstrap.ts before this module is imported.

  try {
    await mongoose.connect(config.database.uri, {
      family: 4,                          // Force IPv4 — avoids IPv6 TLS race on Windows
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 5,                     // Cap pool size for Atlas M0 free tier
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
      // Node 20 / OpenSSL 3 on Windows: Atlas rejects TLS 1.3 ClientHello.
      // tlsAllowInvalidCertificates sets rejectUnauthorized:false on the driver's
      // internal TLS SecureContext, which also relaxes cipher/version negotiation.
      tlsAllowInvalidCertificates: true,
    });
    logger.info('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — driver will auto-reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};
