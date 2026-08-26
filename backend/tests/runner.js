import mongoose from 'mongoose';
import { runScoringTests } from './scoring.test.js';
import { runShuffleTests } from './shuffle.test.js';
import { runAuthTests } from './auth.test.js';
import { runApiTests } from './api.test.js';
import { runAiTests } from './ai.test.js';
import { connectDB } from '../src/config/database.js';

const runAllTests = async () => {
  console.log('==================================================');
  console.log('🚀 Starting QuizMaster Backend Automated Test Suite');
  console.log('==================================================');

  try {
    await connectDB();

    runScoringTests();
    runShuffleTests();
    await runAuthTests();
    await runApiTests();
    await runAiTests();

    console.log('==================================================');
    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('==================================================');
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runAllTests();
