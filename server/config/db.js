import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[ReplyAI] MONGODB_URI not set - running without database (in-memory demo store)');
    return null;
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('[ReplyAI] MongoDB connected');

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[ReplyAI] MongoDB disconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[ReplyAI] MongoDB error:', err.message);
    });
    return mongoose.connection;
  } catch (err) {
    console.warn(`[ReplyAI] MongoDB unavailable (${err.message}) - running in-memory demo store`);
    return null;
  }
};

export const isDBConnected = () => isConnected;
