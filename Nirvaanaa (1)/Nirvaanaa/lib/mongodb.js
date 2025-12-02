import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const envCandidates = [
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '..', 'env.local'),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
}

// Prefer DB_URI if provided, fall back to MONGODB_URI for compatibility
let MONGODB_URI = process.env.DB_URI || process.env.MONGODB_URI;
if (!MONGODB_URI || !/^mongodb(\+srv)?:\/\//.test(MONGODB_URI)) {
  // Be explicit: do not silently continue in production without a proper URI
  if (process.env.NODE_ENV === 'production') {
    console.error('[lib/mongodb] Missing or invalid DB_URI / MONGODB_URI in production environment.');
  }
  MONGODB_URI = 'mongodb://127.0.0.1:27017/nirvaanaa';
  process.env.MONGODB_URI = MONGODB_URI;
  console.warn('[lib/mongodb] DB_URI/MONGODB_URI was missing or invalid, defaulting to local MongoDB instance.');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
