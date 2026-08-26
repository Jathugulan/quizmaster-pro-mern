import assert from 'assert';
import { calculateScoreBreakdown, getGrade, clamp } from '../src/utils/gradeCalculator.js';

export const runScoringTests = () => {
  console.log('🧪 Running Scoring & Grade Calculation Tests...');

  // 1. Clamping tests
  assert.strictEqual(clamp(150, 0, 100), 100, 'Clamp should cap values > 100 to 100');
  assert.strictEqual(clamp(-25, 0, 100), 0, 'Clamp should floor negative values to 0');
  assert.strictEqual(clamp(75.5, 0, 100), 75.5, 'Clamp should preserve values between 0 and 100');

  // 2. Letter Grade tests
  assert.strictEqual(getGrade(100), 'A+');
  assert.strictEqual(getGrade(95), 'A+');
  assert.strictEqual(getGrade(90), 'A+');
  assert.strictEqual(getGrade(85), 'A');
  assert.strictEqual(getGrade(80), 'A');
  assert.strictEqual(getGrade(75), 'B');
  assert.strictEqual(getGrade(70), 'B');
  assert.strictEqual(getGrade(65), 'C');
  assert.strictEqual(getGrade(60), 'C');
  assert.strictEqual(getGrade(55), 'D');
  assert.strictEqual(getGrade(50), 'D');
  assert.strictEqual(getGrade(49.9), 'F');
  assert.strictEqual(getGrade(0), 'F');

  // 3. Perfect Score Test (All Correct)
  const sampleQuestions = [
    { questionId: 'q1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, marks: 2, negativeMarks: 0.5 },
    { questionId: 'q2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, marks: 3, negativeMarks: 1 },
  ];

  const allCorrectAnswers = { q1: 0, q2: 1 };
  const res1 = calculateScoreBreakdown(sampleQuestions, allCorrectAnswers);
  assert.strictEqual(res1.maximum, 5);
  assert.strictEqual(res1.marks, 5);
  assert.strictEqual(res1.percent, 100);
  assert.strictEqual(res1.correct, 2);
  assert.strictEqual(res1.wrong, 0);
  assert.strictEqual(res1.skipped, 0);
  assert.strictEqual(res1.grade, 'A+');

  // 4. Negative Marking & Clamping Test (All Wrong)
  const allWrongAnswers = { q1: 1, q2: 0 };
  const res2 = calculateScoreBreakdown(sampleQuestions, allWrongAnswers);
  assert.strictEqual(res2.correct, 0);
  assert.strictEqual(res2.wrong, 2);
  assert.strictEqual(res2.skipped, 0);
  assert.strictEqual(res2.marks, -1.5);
  assert.strictEqual(res2.percent, 0, 'Percentage should clamp to 0 even if raw marks are negative');
  assert.strictEqual(res2.grade, 'F');

  // 5. Skipped Questions Test
  const skippedAnswers = {};
  const res3 = calculateScoreBreakdown(sampleQuestions, skippedAnswers);
  assert.strictEqual(res3.correct, 0);
  assert.strictEqual(res3.wrong, 0);
  assert.strictEqual(res3.skipped, 2);
  assert.strictEqual(res3.marks, 0);
  assert.strictEqual(res3.percent, 0);

  // 6. Mixed Outcome Test
  const mixedQuestions = [
    { questionId: 'q1', text: 'Q1', options: ['A', 'B'], correctIndex: 0, marks: 2, negativeMarks: 0.5 },
    { questionId: 'q2', text: 'Q2', options: ['A', 'B'], correctIndex: 1, marks: 2, negativeMarks: 0.5 },
    { questionId: 'q3', text: 'Q3', options: ['A', 'B'], correctIndex: 0, marks: 2, negativeMarks: 0.5 },
    { questionId: 'q4', text: 'Q4', options: ['A', 'B'], correctIndex: 0, marks: 2, negativeMarks: 0.5 },
  ]; // max marks = 8
  const mixedAnswers = {
    q1: 0, // correct: +2
    q2: 0, // wrong: -0.5
    q3: 0, // correct: +2
    // q4 skipped: 0
  }; // total marks = 3.5 / 8 = 43.75%
  const res4 = calculateScoreBreakdown(mixedQuestions, mixedAnswers);
  assert.strictEqual(res4.maximum, 8);
  assert.strictEqual(res4.marks, 3.5);
  assert.strictEqual(res4.percent, 43.75);
  assert.strictEqual(res4.correct, 2);
  assert.strictEqual(res4.wrong, 1);
  assert.strictEqual(res4.skipped, 1);
  assert.strictEqual(res4.grade, 'F');

  console.log('✅ Scoring & Grade Calculation Tests Passed Successfully.');
};

if (process.argv[1].endsWith('scoring.test.js')) {
  runScoringTests();
}
