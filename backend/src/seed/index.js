import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { seedAdmin, seedSampleStudents } from './seedAdmin.js';
import { seedSettings } from './seedSettings.js';
import { seedQuizzesAndQuestions } from './seedQuiz.js';

const runSeed = async () => {
  console.log('==================================================');
  console.log('🌱 Starting QuizMaster Database Seeder');
  console.log('==================================================');

  try {
    await connectDB();

    await seedSettings();
    await seedAdmin();
    await seedSampleStudents();
    await seedQuizzesAndQuestions();

    console.log('==================================================');
    console.log('✅ QuizMaster Database Seeding Complete!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

runSeed();
