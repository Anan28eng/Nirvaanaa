
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const envCandidates = [
  path.join(process.cwd(), '.env.production'),
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: true });
    break;
  }
}

let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || !/^mongodb(\+srv)?:\/\//.test(MONGODB_URI)) {
  console.error('[lib/mongodb] ❌ Missing or invalid MONGODB_URI in environment');
  throw new Error('Missing MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
      .then((mongoose) => {
        console.log("[lib/mongodb] ✅ Connected to MongoDB");
        return mongoose;
      })
      .catch((err) => {
        console.error('[lib/mongodb] mongoose.connect error:', err?.message || err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;


