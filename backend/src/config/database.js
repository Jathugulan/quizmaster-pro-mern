import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';
import { seedAdmin, seedSampleStudents } from '../seed/seedAdmin.js';
import { seedSettings } from '../seed/seedSettings.js';
import { seedQuizzesAndQuestions } from '../seed/seedQuiz.js';
import { seedDefaultCategories } from '../services/categoryService.js';

// Configure reliable DNS servers to avoid SRV query issues (ECONNREFUSED) on Windows/certain ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('[MongoDB DNS] Could not set custom DNS servers:', e.message);
}

export const formatMongoUri = (uri) => {
  if (!uri) return uri;
  // Properly handle special characters (e.g. '@' in passwords)
  const lastAt = uri.lastIndexOf('@');
  if (lastAt === -1) return uri;
  const userInfoPart = uri.slice(0, lastAt);
  const hostPart = uri.slice(lastAt + 1);
  const protoMatch = userInfoPart.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!protoMatch) return uri;
  const protocol = protoMatch[1];
  const creds = protoMatch[2];
  const firstColon = creds.indexOf(':');
  if (firstColon === -1) return uri;
  const username = creds.slice(0, firstColon);
  const password = creds.slice(firstColon + 1);
  return protocol + encodeURIComponent(decodeURIComponent(username)) + ':' + encodeURIComponent(decodeURIComponent(password)) + '@' + hostPart;
};

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const primaryUri = formatMongoUri(ENV.MONGODB_URI);
  const fallbackUri = 'mongodb://127.0.0.1:27017/quizmaster';

  // Attempt 1: Primary MongoDB URI
  try {
    console.log('[MongoDB] Connecting to primary database...');
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    await autoSeedIfNeeded();
    return conn.connection;
  } catch (error) {
    console.warn(`[MongoDB Primary Connection Warning] ${error.message}`);
    console.log('[MongoDB] Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/quizmaster)...');

    // Attempt 2: Fallback to local MongoDB
    try {
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 4000,
      });
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to local database: ${fallbackConn.connection.name}`);
      await autoSeedIfNeeded();
      return fallbackConn.connection;
    } catch (fallbackError) {
      console.error(`[MongoDB Fallback Connection Error] ${fallbackError.message}`);
      console.warn('[MongoDB] Database unavailable. Operations will fail until database connection is restored.');
      return null;
    }
  }
};

const autoSeedIfNeeded = async () => {
  try {
    await seedSettings();
    await seedAdmin();
    await seedSampleStudents();
    await seedDefaultCategories();
    await seedQuizzesAndQuestions();
  } catch (e) {
    console.warn('[MongoDB AutoSeed] Notice during seed check:', e.message);
  }
};

export const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: states[state] || 'unknown',
    isConnected: state === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection established.');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection lost. Reconnect will be attempted on next request...');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error]', err.message);
});

export default connectDB;
