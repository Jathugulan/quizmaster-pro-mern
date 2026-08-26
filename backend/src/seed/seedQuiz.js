import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';

export const seedQuizzesAndQuestions = async () => {
  const quizCount = await Quiz.countDocuments();
  if (quizCount > 0) {
    console.log(`[Seed] ${quizCount} quizzes already exist. Skipping quiz seeding.`);
    return;
  }

  // 1. Seed Questions
  const rawQuestions = [
    // Computer Science Basics
    {
      text: 'What does "CPU" stand for?',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Utility', 'Core Performance Unit'],
      correctIndex: 0,
      marks: 1,
      negativeMarks: 0,
      explanation: 'The CPU (Central Processing Unit) is the primary component that executes instructions.',
      isActive: true,
    },
    {
      text: 'Which data structure follows the First-In-First-Out (FIFO) order?',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['Stack', 'Queue', 'Tree', 'Hash Map'],
      correctIndex: 1,
      marks: 1,
      negativeMarks: 0,
      explanation: 'A queue is FIFO — the first element added is the first one removed.',
      isActive: true,
    },
    {
      text: 'What is the primary function of an operating system?',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['To browse the internet', 'To manage hardware and software resources', 'To compile code', 'To generate electricity'],
      correctIndex: 1,
      marks: 1,
      negativeMarks: 0,
      explanation: 'An OS manages hardware resources and provides common services for application programs.',
      isActive: true,
    },
    {
      text: 'Which of the following is an example of volatile memory?',
      category: 'Computer Science',
      difficulty: 'Medium',
      type: 'multiple-choice',
      options: ['Hard disk drive', 'Solid state drive', 'RAM', 'DVD-ROM'],
      correctIndex: 2,
      marks: 1,
      negativeMarks: 0,
      explanation: 'RAM is volatile memory; its contents are lost when power is turned off.',
      isActive: true,
    },
    {
      text: 'In binary, the decimal number 5 is written as:',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['100', '101', '110', '011'],
      correctIndex: 1,
      marks: 1,
      negativeMarks: 0,
      explanation: 'Decimal 5 equals 4 + 1 = 101 in binary notation.',
      isActive: true,
    },

    // Data Structures & Algorithms
    {
      text: 'What is the time complexity of binary search on a sorted array of size n?',
      category: 'Computer Science',
      difficulty: 'Medium',
      type: 'multiple-choice',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'Binary search halves the search space at each iteration, giving logarithmic time complexity O(log n).',
      isActive: true,
    },
    {
      text: 'A binary tree where every node has at most two children is known as a:',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['Binary Tree', 'B-Tree', 'Trie', 'Graph'],
      correctIndex: 0,
      marks: 1,
      negativeMarks: 0,
      explanation: 'A binary tree is a tree data structure in which each node has at most two children.',
      isActive: true,
    },
    {
      text: 'Which sorting algorithm has the best average-case time complexity of O(n log n)?',
      category: 'Computer Science',
      difficulty: 'Hard',
      type: 'multiple-choice',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correctIndex: 2,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'Merge Sort guarantees O(n log n) time complexity in worst, average, and best cases.',
      isActive: true,
    },
    {
      text: 'HTTP is a stateless protocol.',
      category: 'Computer Science',
      difficulty: 'Easy',
      type: 'boolean',
      options: ['True', 'False'],
      correctIndex: 0,
      marks: 1,
      negativeMarks: 0,
      explanation: 'HTTP is stateless by default; each request is executed independently without retaining session state.',
      isActive: true,
    },

    // Web Development
    {
      text: 'Which HTML element is used to specify a footer for a document or section?',
      category: 'Web Development',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['<bottom>', '<footer>', '<section>', '<aside>'],
      correctIndex: 1,
      marks: 1,
      negativeMarks: 0,
      explanation: 'The <footer> semantic element defines a footer for a document or section.',
      isActive: true,
    },
    {
      text: 'What does CSS stand for?',
      category: 'Web Development',
      difficulty: 'Easy',
      type: 'multiple-choice',
      options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Structure', 'Colorful Sheet Styling'],
      correctIndex: 0,
      marks: 1,
      negativeMarks: 0,
      explanation: 'CSS stands for Cascading Style Sheets.',
      isActive: true,
    },
  ];

  const createdQuestions = await Question.insertMany(rawQuestions);
  console.log(`[Seed] Seeded ${createdQuestions.length} questions.`);

  const csQuestions = createdQuestions.slice(0, 5).map((q) => q._id);
  const dsaQuestions = createdQuestions.slice(5, 9).map((q) => q._id);
  const webQuestions = createdQuestions.slice(9).map((q) => q._id);

  // 2. Seed Quizzes
  const quizzes = [
    {
      title: 'Intro to Computer Science',
      description: 'A gentle introduction covering programming fundamentals, data structures and computer architecture.',
      category: 'Computer Science',
      difficulty: 'Easy',
      durationSeconds: 600,
      passingScore: 50,
      questionIds: csQuestions,
      status: 'published',
      settings: {
        randomize: true,
        shuffleAnswers: true,
        showExplanations: true,
        allowRetake: true,
      },
    },
    {
      title: 'Data Structures & Algorithms Mastery',
      description: 'Test your grasp on asymptotic complexities, tree traversals, sorting algorithms and searching techniques.',
      category: 'Computer Science',
      difficulty: 'Hard',
      durationSeconds: 900,
      passingScore: 60,
      questionIds: dsaQuestions,
      status: 'published',
      settings: {
        randomize: false,
        shuffleAnswers: false,
        showExplanations: true,
        allowRetake: true,
      },
    },
    {
      title: 'Web Fundamentals & Standards',
      description: 'Foundational concepts in HTML5 semantic structure, CSS styling, and client-server web protocols.',
      category: 'Web Development',
      difficulty: 'Easy',
      durationSeconds: 480,
      passingScore: 50,
      questionIds: webQuestions,
      status: 'published',
      settings: {
        randomize: true,
        shuffleAnswers: true,
        showExplanations: true,
        allowRetake: true,
      },
    },
  ];

  await Quiz.insertMany(quizzes);
  console.log(`[Seed] Seeded ${quizzes.length} published quizzes.`);
};

export default { seedQuizzesAndQuestions };
