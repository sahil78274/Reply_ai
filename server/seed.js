import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import seedDemo from './utils/seedDemo.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function runSeed() {
  try {
    const db = await connectDB();

    if (!db) {
      throw new Error('MongoDB not connected. Check MONGODB_URI in root .env');
    }

    await seedDemo();
    console.log('Demo account seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

runSeed();