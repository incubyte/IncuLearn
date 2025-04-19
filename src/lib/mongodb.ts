import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize the cache
const globalCache: { mongooseCache: MongooseCache } = global as any;
if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    const cache = globalCache.mongooseCache;

    if (cache.conn) {
      console.log('Using cached database connection');
      return cache.conn;
    }

    if (!cache.promise) {
      console.log('Creating new database connection');
      const opts = {
        bufferCommands: false,
      };

      cache.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        return mongoose;
      });
    }
    
    try {
      cache.conn = await cache.promise;
      return cache.conn;
    } catch (error) {
      cache.promise = null;
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in connectToDatabase:', error);
    throw new Error('Failed to connect to database');
  }
}