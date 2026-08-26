/**
 * Fisher-Yates array shuffling and choice remapping utilities.
 */

export const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Shuffles question option choices and recalculates correctIndex accordingly.
 * Does not mutate the input question.
 */
export const shuffleQuestionOptions = (question) => {
  if (!question.options || question.options.length <= 1) {
    return { ...question };
  }

  const originalOptions = [...question.options];
  const originalCorrectIndex = question.correctIndex;
  const indices = originalOptions.map((_, i) => i);
  const shuffledIndices = shuffleArray(indices);

  const newOptions = shuffledIndices.map((origIdx) => originalOptions[origIdx]);
  const newCorrectIndex = shuffledIndices.indexOf(originalCorrectIndex);

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex,
  };
};

export default { shuffleArray, shuffleQuestionOptions };
