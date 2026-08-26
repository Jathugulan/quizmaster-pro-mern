import assert from 'assert';
import { shuffleArray, shuffleQuestionOptions } from '../src/utils/shuffle.js';

export const runShuffleTests = () => {
  console.log('🧪 Running Fisher-Yates & Correct Index Remapping Tests...');

  // 1. Array Shuffling
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffleArray(original);
  assert.strictEqual(shuffled.length, original.length, 'Shuffled array must retain original length');
  assert.deepStrictEqual([...shuffled].sort((a, b) => a - b), original, 'Shuffled array must contain identical elements');

  // 2. Choice Shuffling & Correct Index Remapping
  const q = {
    questionId: 'test-q1',
    text: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctIndex: 2, // Paris
    marks: 1,
  };

  for (let i = 0; i < 20; i++) {
    const shuffledQ = shuffleQuestionOptions(q);
    assert.strictEqual(shuffledQ.options.length, 4, 'Options length must remain 4');
    assert.strictEqual(
      shuffledQ.options[shuffledQ.correctIndex],
      'Paris',
      `Remapped correctIndex must always point to the correct answer 'Paris' (Got index ${shuffledQ.correctIndex})`
    );
  }

  // 3. Question without shuffling when <= 1 option
  const singleOptionQ = {
    text: 'Single option test',
    options: ['Only One'],
    correctIndex: 0,
  };
  const resSingle = shuffleQuestionOptions(singleOptionQ);
  assert.deepStrictEqual(resSingle, singleOptionQ);

  console.log('✅ Fisher-Yates & Option Remapping Tests Passed Successfully.');
};

if (process.argv[1].endsWith('shuffle.test.js')) {
  runShuffleTests();
}
