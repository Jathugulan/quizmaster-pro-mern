import geminiService from "../services/geminiService.js";
import analyticsService from "../services/analyticsService.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Quiz from "../models/Quiz.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/ai/generate-quiz and POST /api/ai/generate-questions (admin)
export const generateQuestions = asyncHandler(async (req, res) => {
  const {
    topic,
    difficulty = "medium",
    count = 5,
    questionCount,
    type = "multiple-choice",
    questionType,
    category,
  } = req.body;

  const finalTopic = topic || category;
  if (!finalTopic || !finalTopic.trim()) {
    const err = new Error("Topic is required to generate quiz questions.");
    err.statusCode = 400;
    throw err;
  }

  const questions = await geminiService.generateQuestionsWithAI({
    topic: finalTopic.trim(),
    difficulty,
    count: questionCount || count,
    questionCount: questionCount || count,
    type: questionType || type,
    questionType: questionType || type,
  });

  return sendSuccess(
    res,
    { questions, count: questions.length },
    "AI questions generated successfully. Review before saving to question bank."
  );
});

// POST /api/ai/analyze-question (admin)
export const analyzeQuestion = asyncHandler(async (req, res) => {
  const { questionId, questionData, question, options, correctAnswer, explanation, difficulty } = req.body;

  let qData = questionData;
  if (questionId && !qData) {
    const q = await Question.findById(questionId).lean();
    if (!q) {
      const err = new Error("Question not found.");
      err.statusCode = 404;
      throw err;
    }
    qData = q;
  }

  if (!qData) {
    if (question || req.body.text) {
      qData = {
        question: question || req.body.text,
        text: question || req.body.text,
        options: options || [],
        correctAnswer: correctAnswer || (options && req.body.correctIndex !== undefined ? options[req.body.correctIndex] : ""),
        correctIndex: req.body.correctIndex ?? 0,
        difficulty: difficulty || "medium",
        explanation: explanation || "",
      };
    }
  }

  if (!qData || (!qData.text && !qData.question)) {
    const err = new Error("Question text and options are required for analysis.");
    err.statusCode = 400;
    throw err;
  }

  const analysis = await geminiService.analyzeQuestion(qData);
  return sendSuccess(res, analysis, "Question quality analysis completed.");
});

// POST /api/ai/performance-analysis (student - self)
export const analyzeMyPerformance = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId).select("name email").lean();

  const [statsAgg, categoryAgg, recentAttempts] = await Promise.all([
    Attempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$result.percent" },
          passedCount: { $sum: { $cond: ["$passed", 1, 0] } },
        },
      },
    ]),
    Attempt.aggregate([
      { $match: { userId } },
      { $group: { _id: "$category", avgScore: { $avg: "$result.percent" }, count: { $sum: 1 } } },
      { $project: { _id: 0, category: { $ifNull: ["$_id", "General"] }, avgScore: { $round: ["$avgScore", 1] }, count: 1 } },
    ]),
    Attempt.find({ userId }).sort({ submittedAt: -1 }).limit(5).lean(),
  ]);

  const st = statsAgg[0] || { totalAttempts: 0, avgScore: 0, passedCount: 0 };
  const studentData = {
    name: user?.name || "Student",
    totalAttempts: st.totalAttempts,
    avgScore: Math.round((st.avgScore || 0) * 10) / 10,
    passRate: st.totalAttempts > 0 ? Math.round((st.passedCount / st.totalAttempts) * 100) : 0,
    categoryPerformance: categoryAgg,
    recentAttempts: recentAttempts.map((a) => ({
      title: a.title,
      category: a.category,
      percent: Math.round(a.result?.percent || 0),
      passed: a.passed,
    })),
  };

  const analysis = await geminiService.analyzeStudentPerformance(studentData);
  return sendSuccess(res, analysis, "Student performance analysis retrieved.");
});

// POST /api/ai/student-performance/:studentId (admin)
export const analyzeStudentPerformance = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.studentId).select("name username email").lean();
  if (!student) {
    const err = new Error("Student not found.");
    err.statusCode = 404;
    throw err;
  }

  const [statsAgg, categoryAgg, recentAttempts] = await Promise.all([
    Attempt.aggregate([
      { $match: { userId: student._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$result.percent" },
          passedCount: { $sum: { $cond: ["$passed", 1, 0] } },
        },
      },
    ]),
    Attempt.aggregate([
      { $match: { userId: student._id } },
      { $group: { _id: "$category", avgScore: { $avg: "$result.percent" }, count: { $sum: 1 } } },
      { $project: { _id: 0, category: { $ifNull: ["$_id", "General"] }, avgScore: { $round: ["$avgScore", 1] }, count: 1 } },
    ]),
    Attempt.find({ userId: student._id }).sort({ submittedAt: -1 }).limit(5).lean(),
  ]);

  const st = statsAgg[0] || { totalAttempts: 0, avgScore: 0, passedCount: 0 };
  const studentData = {
    name: student.name,
    totalAttempts: st.totalAttempts,
    avgScore: Math.round((st.avgScore || 0) * 10) / 10,
    passRate: st.totalAttempts > 0 ? Math.round((st.passedCount / st.totalAttempts) * 100) : 0,
    categoryPerformance: categoryAgg,
    recentAttempts: recentAttempts.map((a) => ({
      title: a.title,
      category: a.category,
      percent: Math.round(a.result?.percent || 0),
      passed: a.passed,
    })),
  };

  const analysis = await geminiService.analyzeStudentPerformance(studentData);
  return sendSuccess(
    res,
    { student: { id: student._id.toString(), name: student.name }, analysis },
    "Student performance analyzed."
  );
});

// POST /api/ai/recommendations (student - own data only)
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const [statsAgg, categoryAgg, activeQuizzes] = await Promise.all([
    Attempt.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, avgScore: { $avg: "$result.percent" }, count: { $sum: 1 } } },
    ]),
    Attempt.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$category", avgScore: { $avg: "$result.percent" }, count: { $sum: 1 } } },
      { $sort: { avgScore: 1 } },
    ]),
    Quiz.find({ status: "published" }).select("title category difficulty").limit(10).lean(),
  ]);

  const st = statsAgg[0] || { avgScore: 0, count: 0 };
  const categories = categoryAgg.map((c) => ({ category: c._id || "General", score: Math.round(c.avgScore || 0) }));
  const weak = categories.filter((c) => c.score < 60).map((c) => c.category);
  const strong = categories.filter((c) => c.score >= 80).map((c) => c.category);

  const profile = {
    avgScore: Math.round((st.avgScore || 0) * 10) / 10,
    completedQuizzes: st.count,
    weakCategories: weak,
    strongCategories: strong,
    availableCategories: categories.map((c) => c.category),
    availableQuizzes: activeQuizzes.map((q) => ({ title: q.title, category: q.category })),
  };

  const recommendations = await geminiService.generateRecommendations(profile);
  return sendSuccess(res, recommendations, "Personalized recommendations generated.");
});

// POST /api/ai/student-assistant and POST /api/ai/study-assistant (student)
export const studyAssistant = asyncHandler(async (req, res) => {
  const message = req.body.message || req.body.question;
  const includeContext = req.body.includeContext !== false;

  if (!message || !message.trim()) {
    const err = new Error("Message is required for AI study assistant.");
    err.statusCode = 400;
    throw err;
  }

  let context = {};
  if (includeContext) {
    const userId = req.user.userId;
    const [wrongAttempts, categoryAgg] = await Promise.all([
      Attempt.find({ userId, passed: false }).sort({ submittedAt: -1 }).limit(3).lean(),
      Attempt.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", avgScore: { $avg: "$result.percent" } } },
        { $match: { avgScore: { $lt: 60 } } },
        { $limit: 3 },
      ]),
    ]);

    context.recentWrongAnswers = wrongAttempts.map((a) => ({ title: a.title, category: a.category }));
    context.weakCategories = categoryAgg.map((c) => c._id).filter(Boolean);
  }

  const result = await geminiService.studyAssistant(message.trim(), context);
  return sendSuccess(res, result, "AI study response generated.");
});

// POST /api/ai/admin-assistant (admin)
export const adminAssistant = asyncHandler(async (req, res) => {
  const question = req.body.question || req.body.message;
  if (!question || !question.trim()) {
    const err = new Error("Question is required for admin assistant.");
    err.statusCode = 400;
    throw err;
  }

  // Gather real platform analytics for context
  const kpis = await analyticsService.getAdminOverviewKPIs().catch(() => ({ kpiCards: [] }));
  const perf = await analyticsService.getStudentPerformanceOverview().catch(() => ({ topStudents: [], atRiskStudents: [] }));

  const cards = kpis.kpiCards || [];
  const getVal = (id) => cards.find((c) => c.id === id)?.value || 0;

  const analyticsData = {
    totalStudents: getVal("totalStudents"),
    totalQuizzes: getVal("totalQuizzes"),
    totalAttempts: getVal("totalAttempts"),
    avgScore: parseFloat(String(getVal("averageScore")).replace("%", "") || "0"),
    passRate: parseFloat(String(getVal("completionRate")).replace("%", "") || "0"),
    atRiskCount: perf?.atRiskStudents?.length || 0,
    topPerformersCount: perf?.topStudents?.length || 0,
  };

  const result = await geminiService.adminAssistant(question.trim(), analyticsData);
  return sendSuccess(res, result, "AI admin response generated.");
});

export default {
  generateQuestions,
  analyzeQuestion,
  analyzeMyPerformance,
  analyzeStudentPerformance,
  getRecommendations,
  studyAssistant,
  adminAssistant,
};

