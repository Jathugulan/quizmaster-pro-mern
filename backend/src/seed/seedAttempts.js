import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

export const seedSampleAttemptsAndActivity = async () => {
  const attemptCount = await Attempt.countDocuments();
  if (attemptCount > 0) {
    return;
  }

  const [students, quizzes, questions] = await Promise.all([
    User.find({ role: 'user' }),
    Quiz.find({ status: 'published' }),
    Question.find(),
  ]);

  if (students.length === 0 || quizzes.length === 0 || questions.length === 0) {
    return;
  }

  const attemptsToInsert = [];
  const now = Date.now();

  const samplePerformances = [
    { studentIndex: 0, quizIndex: 0, percent: 92, passed: true, grade: 'A+', timeTaken: 240, daysAgo: 5 },
    { studentIndex: 0, quizIndex: 1, percent: 86, passed: true, grade: 'A', timeTaken: 450, daysAgo: 3 },
    { studentIndex: 0, quizIndex: 2, percent: 96, passed: true, grade: 'A+', timeTaken: 180, daysAgo: 1 },

    { studentIndex: 1, quizIndex: 0, percent: 78, passed: true, grade: 'B', timeTaken: 320, daysAgo: 6 },
    { studentIndex: 1, quizIndex: 1, percent: 64, passed: true, grade: 'C', timeTaken: 510, daysAgo: 4 },
    { studentIndex: 1, quizIndex: 2, percent: 84, passed: true, grade: 'A', timeTaken: 210, daysAgo: 2 },

    { studentIndex: 2, quizIndex: 0, percent: 45, passed: false, grade: 'F', timeTaken: 580, daysAgo: 7 },
    { studentIndex: 2, quizIndex: 1, percent: 52, passed: false, grade: 'F', timeTaken: 620, daysAgo: 3 },
  ];

  for (const p of samplePerformances) {
    const student = students[p.studentIndex % students.length];
    const quiz = quizzes[p.quizIndex % quizzes.length];

    const quizQuestions = questions.slice(0, 5);
    const correctCount = Math.round((p.percent / 100) * quizQuestions.length);
    const wrongCount = quizQuestions.length - correctCount;

    const perQuestion = quizQuestions.map((q, idx) => {
      const isCorrect = idx < correctCount;
      return {
        questionId: q._id.toString(),
        text: q.text,
        options: q.options,
        selected: isCorrect ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
        outcome: isCorrect ? 'correct' : 'wrong',
        gained: isCorrect ? (q.marks || 1) : 0,
      };
    });

    const submittedDate = new Date(now - p.daysAgo * 24 * 60 * 60 * 1000);

    attemptsToInsert.push({
      userId: student._id,
      quizId: quiz._id,
      title: quiz.title,
      category: quiz.category || 'Computer Science',
      difficulty: quiz.difficulty || 'Medium',
      passingScore: quiz.passingScore || 50,
      showExplanations: true,
      durationSeconds: quiz.durationSeconds || 600,
      timeTakenSeconds: p.timeTaken,
      startedAt: new Date(submittedDate.getTime() - p.timeTaken * 1000),
      submittedAt: submittedDate,
      questionSnapshot: perQuestion,
      answers: new Map(perQuestion.map((q, i) => [String(i), q.selected])),
      flagged: new Map(),
      result: {
        maximum: quizQuestions.length,
        marks: correctCount,
        percent: p.percent,
        correct: correctCount,
        wrong: wrongCount,
        skipped: 0,
        perQuestion,
        answerCount: quizQuestions.length,
      },
      passed: p.passed,
      grade: p.grade,
      certificate: {
        eligible: p.passed,
        verificationId: p.passed ? `QM-${student.username.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}` : null,
        issuedAt: p.passed ? submittedDate : null,
      },
    });
  }

  await Attempt.insertMany(attemptsToInsert);
  console.log(`[Seed] Seeded ${attemptsToInsert.length} realistic student attempts.`);

  // Seed sample Activity Logs
  await ActivityLog.insertMany([
    {
      type: 'user_registered',
      message: 'Student account John Doe registered via self-service portal.',
      userName: 'John Doe',
      userRole: 'user',
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'quiz_published',
      message: 'Quiz "Intro to Computer Science" was published by Administrator.',
      userName: 'Admin',
      userRole: 'admin',
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'quiz_completed',
      message: 'Student Sarah Smith completed "Intro to Computer Science" with Grade A+ (92%).',
      userName: 'Sarah Smith',
      userRole: 'user',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'certificate_issued',
      message: 'Verified academic certificate generated for Sarah Smith.',
      userName: 'System Engine',
      userRole: 'system',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'quiz_completed',
      message: 'Student Alex Johnson completed "Data Structures & Algorithms Mastery".',
      userName: 'Alex Johnson',
      userRole: 'user',
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Seed sample Admin Notifications
  await Notification.insertMany([
    {
      title: 'High-Performing Student Alert',
      message: 'Sarah Smith achieved a 96% distinction score on Web Fundamentals & Standards.',
      type: 'achievement',
      targetRole: 'admin',
      isRead: false,
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'New Student Registration',
      message: 'Alex Johnson created an account and enrolled in the examination platform.',
      type: 'info',
      targetRole: 'admin',
      isRead: false,
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'At-Risk Candidate Flag',
      message: 'Candidate John Doe failed 2 consecutive attempts on Computer Science assessments.',
      type: 'warning',
      targetRole: 'admin',
      isRead: true,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    },
  ]);
};

export default { seedSampleAttemptsAndActivity };
