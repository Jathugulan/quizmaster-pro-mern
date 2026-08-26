import assert from 'assert';
import geminiService from '../src/services/geminiService.js';

export const runAiTests = async () => {
  console.log('🧪 Running Gemini AI Studio Backend Integration Tests...');

  // 1. Test Question Analysis with Gemini
  const questionData = {
    question: 'Which HTTP status code signifies a successful resource creation?',
    options: ['200 OK', '201 Created', '400 Bad Request', '500 Server Error'],
    correctAnswer: '201 Created',
    difficulty: 'easy',
    explanation: '201 Created indicates that the request has succeeded and led to the creation of a resource.',
  };

  const analysis = await geminiService.analyzeQuestion(questionData);
  assert.ok(analysis, 'Analysis response must exist');
  assert.ok(typeof analysis.qualityScore === 'number' || typeof analysis.overallScore === 'number', 'Quality score must be a number');
  assert.ok(analysis.verdict, 'Analysis must have a verdict');

  // 2. Test AI Admin Assistant with Real Analytics context
  const adminRes = await geminiService.adminAssistant('What is the current platform pass rate?', {
    totalStudents: 50,
    totalQuizzes: 12,
    passRate: 78,
  });
  assert.ok(adminRes && adminRes.response, 'Admin assistant must return a response');

  console.log('✅ Gemini AI Studio Backend Tests Passed Successfully.');
};

if (process.argv[1].endsWith('ai.test.js')) {
  runAiTests();
}
