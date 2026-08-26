import analyticsService from '../services/analyticsService.js';
import settingService from '../services/settingService.js';
import attemptService from '../services/attemptService.js';
import activityService from '../services/activityService.js';
import notificationService from '../services/notificationService.js';
import certificateService from '../services/certificateService.js';
import studentGroupService from '../services/studentGroupService.js';
import achievementService from '../services/achievementService.js';
import certificateRequestService from '../services/certificateRequestService.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import Certificate from '../models/Certificate.js';
import CertificateTemplate from '../models/CertificateTemplate.js';
import CertificateRequest from '../models/CertificateRequest.js';
import StudentGroup from '../models/StudentGroup.js';
import Achievement from '../models/Achievement.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';


// -------------------------------------------------------------
// 1. Dashboard Overview KPIs & Analytics
// -------------------------------------------------------------
export const getDashboardKPIs = asyncHandler(async (req, res) => {
  const kpis = await analyticsService.getAdminOverviewKPIs();
  return sendSuccess(res, kpis, 'Admin dashboard KPIs aggregated.');
});

export const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await analyticsService.getAdminMetrics();
  const perf = await analyticsService.getStudentPerformanceOverview();
  return sendSuccess(res, { ...metrics, ...perf }, 'Admin metrics aggregated successfully.');
});

export const getAnalyticsDetailed = asyncHandler(async (req, res) => {
  const detailed = await analyticsService.getAdminAnalyticsDetailed();
  return sendSuccess(res, detailed, 'Detailed analytics aggregated.');
});

export const getAiInsights = asyncHandler(async (req, res) => {
  const insights = await analyticsService.getAIAdminInsights();
  return sendSuccess(res, insights, 'AI performance insights generated.');
});

// -------------------------------------------------------------
// 2. Student Management & Details
// -------------------------------------------------------------
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10, 100);
  const filter = {};

  if (req.query.role && req.query.role !== 'all') {
    filter.role = req.query.role;
  } else {
    filter.role = 'user'; // Default to students
  }

  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const s = req.query.search.trim();
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { username: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }

  // Sorting
  const sort = {};
  const sortBy = req.query.sortBy || 'joinedAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  sort[sortBy] = order;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Aggregate user attempt statistics and certificate counts
  const userIds = users.map((u) => u._id);
  const [attemptStats, certStats] = await Promise.all([
    Attempt.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          attemptsCount: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          highestScore: { $max: '$result.percent' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
          lastActive: { $max: '$submittedAt' },
          distinctQuizzes: { $addToSet: '$quizId' },
        },
      },
    ]),
    Certificate.aggregate([
      { $match: { studentId: { $in: userIds }, status: 'issued' } },
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
    ]),
  ]);

  const statsMap = new Map();
  attemptStats.forEach((st) => {
    statsMap.set(st._id.toString(), {
      attemptsCount: st.attemptsCount,
      avgScore: Math.round(st.avgScore * 10) / 10,
      highestScore: Math.round(st.highestScore * 10) / 10,
      passRate: st.attemptsCount > 0 ? Math.round((st.passedCount / st.attemptsCount) * 100) : 0,
      completionRate: st.attemptsCount > 0 ? Math.round((st.passedCount / st.attemptsCount) * 100) : 0,
      lastActive: st.lastActive,
      totalQuizzes: (st.distinctQuizzes || []).length,
    });
  });

  const certMap = new Map();
  certStats.forEach((c) => certMap.set(c._id.toString(), c.count));

  const formattedUsers = users.map((u) => {
    const st = statsMap.get(u._id.toString()) || {
      attemptsCount: 0,
      avgScore: 0,
      highestScore: 0,
      passRate: 0,
      completionRate: 0,
      lastActive: u.joinedAt,
      totalQuizzes: 0,
    };
    const certCount = certMap.get(u._id.toString()) || 0;
    return {
      id: u._id.toString(),
      studentId: `STU-${u._id.toString().slice(-6).toUpperCase()}`,
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone || '+1 (555) 019-2834',
      role: u.role,
      status: u.status,
      photo: u.photo,
      joinedAt: u.joinedAt,
      totalQuizzes: st.totalQuizzes,
      completedAttempts: st.attemptsCount,
      totalAttempts: st.attemptsCount,
      averageScore: st.avgScore,
      highestScore: st.highestScore,
      passRate: st.passRate,
      completionRate: st.completionRate,
      certificatesEarned: certCount,
      points: u.points || Math.round(st.avgScore * (st.attemptsCount || 1) * 8),
      badges: (u.badges && u.badges.length > 0) ? u.badges : (st.avgScore >= 90 ? ['High Performer'] : certCount > 0 ? ['Certified Scholar'] : ['Candidate']),
      lastActive: st.lastActive || u.joinedAt,
    };
  });

  // Client-requested performance & certificate filtering
  let finalItems = formattedUsers;
  if (req.query.performance === 'top') {
    finalItems = formattedUsers.filter((u) => u.averageScore >= 80);
  } else if (req.query.performance === 'low') {
    finalItems = formattedUsers.filter((u) => u.averageScore < 60 && u.completedAttempts > 0);
  }

  if (req.query.certificate === 'earned') {
    finalItems = finalItems.filter((u) => u.certificatesEarned > 0);
  } else if (req.query.certificate === 'none') {
    finalItems = finalItems.filter((u) => u.certificatesEarned === 0);
  }

  return sendSuccess(res, formatPaginatedResponse(finalItems, total, page, limit), 'Users retrieved.');
});


export const getStudentDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash').lean();
  if (!user) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  const [attempts, statsAgg, categoryAgg] = await Promise.all([
    Attempt.find({ userId: user._id })
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean(),
    Attempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          highestScore: { $max: '$result.percent' },
          lowestScore: { $min: '$result.percent' },
          totalMarks: { $sum: '$result.marks' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
          totalTimeSeconds: { $sum: '$timeTakenSeconds' },
          distinctQuizzes: { $addToSet: '$quizId' },
        },
      },
    ]),
    Attempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ['$_id', 'General'] },
          count: 1,
          avgScore: { $round: ['$avgScore', 1] },
          passRate: {
            $round: [
              {
                $multiply: [{ $divide: ['$passedCount', { $cond: [{ $eq: ['$count', 0] }, 1, '$count'] }] }, 100],
              },
              1,
            ],
          },
        },
      },
    ]),
  ]);

  const st = statsAgg[0] || {
    totalAttempts: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
    totalMarks: 0,
    passedCount: 0,
    totalTimeSeconds: 0,
    distinctQuizzes: [],
  };

  const studentProfile = {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    photo: user.photo,
    status: user.status,
    role: user.role,
    joinedAt: user.joinedAt,
    lastActive: attempts[0]?.submittedAt || user.joinedAt,
    metrics: {
      totalQuizzes: st.distinctQuizzes.length,
      totalAttempts: st.totalAttempts,
      averageScore: Math.round((st.avgScore || 0) * 10) / 10,
      highestScore: Math.round((st.highestScore || 0) * 10) / 10,
      lowestScore: Math.round((st.lowestScore || 0) * 10) / 10,
      totalMarks: st.totalMarks,
      passRate: st.totalAttempts > 0 ? Math.round((st.passedCount / st.totalAttempts) * 100) : 0,
      totalTimeSeconds: st.totalTimeSeconds,
      learningStreak: Math.min(st.totalAttempts, 7),
    },
    categoryPerformance: categoryAgg,
    recentAttempts: attempts.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      category: a.category,
      difficulty: a.difficulty,
      percent: Math.round(a.result?.percent || 0),
      marks: a.result?.marks || 0,
      maximum: a.result?.maximum || 0,
      passed: a.passed,
      grade: a.grade,
      timeTakenSeconds: a.timeTakenSeconds,
      submittedAt: a.submittedAt,
    })),
  };

  return sendSuccess(res, studentProfile, 'Student profile retrieved.');
});

export const getStudentProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name username email').lean();
  if (!user) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  const [progressionOverTime, categoryPerformance] = await Promise.all([
    Attempt.find({ userId: user._id })
      .sort({ submittedAt: 1 })
      .select('title submittedAt result.percent result.marks passed')
      .lean(),
    Attempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$category',
          attempts: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
        },
      },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ['$_id', 'General'] },
          attempts: 1,
          avgScore: { $round: ['$avgScore', 1] },
        },
      },
    ]),
  ]);

  return sendSuccess(
    res,
    {
      student: { id: user._id.toString(), name: user.name, username: user.username },
      progression: progressionOverTime.map((p, idx) => ({
        attemptIndex: idx + 1,
        title: p.title,
        date: p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : '',
        score: Math.round(p.result?.percent || 0),
        passed: p.passed,
      })),
      categoryPerformance,
    },
    'Student progress retrieved.'
  );
});

export const compareStudents = asyncHandler(async (req, res) => {
  const studentIds = (req.query.ids || '').split(',').filter(Boolean);
  if (studentIds.length === 0) {
    return sendSuccess(res, { comparisons: [] }, 'No students selected for comparison.');
  }

  const users = await User.find({ _id: { $in: studentIds } }).select('-passwordHash').lean();

  const comparisons = await Promise.all(
    users.map(async (u) => {
      const [statsAgg, catAgg] = await Promise.all([
        Attempt.aggregate([
          { $match: { userId: u._id } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              avgScore: { $avg: '$result.percent' },
              highestScore: { $max: '$result.percent' },
              passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
              totalTime: { $sum: '$timeTakenSeconds' },
            },
          },
        ]),
        Attempt.aggregate([
          { $match: { userId: u._id } },
          {
            $group: {
              _id: '$category',
              avgScore: { $avg: '$result.percent' },
            },
          },
        ]),
      ]);

      const st = statsAgg[0] || { totalAttempts: 0, avgScore: 0, highestScore: 0, passedCount: 0, totalTime: 0 };
      const catMap = {};
      catAgg.forEach((c) => {
        catMap[c._id || 'General'] = Math.round(c.avgScore || 0);
      });

      return {
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        photo: u.photo,
        avgScore: Math.round((st.avgScore || 0) * 10) / 10,
        totalAttempts: st.totalAttempts,
        highestScore: Math.round((st.highestScore || 0) * 10) / 10,
        passRate: st.totalAttempts > 0 ? Math.round((st.passedCount / st.totalAttempts) * 100) : 0,
        totalTimeMinutes: Math.round((st.totalTime || 0) / 60),
        categories: catMap,
      };
    })
  );

  return sendSuccess(res, { comparisons }, 'Student comparison data aggregated.');
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin' && req.body.status === 'blocked') {
    const error = new Error('Administrator accounts cannot be blocked.');
    error.statusCode = 400;
    throw error;
  }

  user.status = req.body.status;
  await user.save();

  await activityService.logActivity({
    type: 'user_status_changed',
    message: `Student '${user.name}' account status changed to '${user.status}' by admin.`,
    userId: req.user?.id,
    userName: req.user?.name || 'Administrator',
    userRole: 'admin',
    metadata: { targetUserId: user._id.toString(), status: user.status },
  });

  return sendSuccess(res, { id: user._id.toString(), status: user.status }, `User status updated to '${user.status}'.`);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') {
    const error = new Error('Administrator accounts cannot be deleted.');
    error.statusCode = 400;
    throw error;
  }

  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    Attempt.deleteMany({ userId: req.params.id }),
  ]);

  await activityService.logActivity({
    type: 'user_status_changed',
    message: `Student '${user.name}' and all attempt records deleted by admin.`,
    userId: req.user?.id,
    userName: req.user?.name || 'Administrator',
    userRole: 'admin',
  });

  return sendSuccess(res, { success: true }, `Student '${user.name}' has been deleted.`);
});

// -------------------------------------------------------------
// 3. Quiz Marks & Results Management
// -------------------------------------------------------------
export const listResults = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15, 100);
  const filter = {};

  if (req.query.quizId) filter.quizId = req.query.quizId;
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
  if (req.query.difficulty && req.query.difficulty !== 'all') filter.difficulty = req.query.difficulty;
  if (req.query.passed !== undefined && req.query.passed !== 'all') filter.passed = req.query.passed === 'true';

  if (req.query.search) {
    const s = req.query.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
    ];
  }

  const [attempts, total] = await Promise.all([
    Attempt.find(filter)
      .populate('userId', 'name username email photo')
      .populate('quizId', 'title category')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attempt.countDocuments(filter),
  ]);

  const items = attempts.map((a, idx) => ({
    id: a._id.toString(),
    attemptNumber: idx + 1,
    student: {
      id: a.userId?._id?.toString() || 'unknown',
      name: a.userId?.name || 'Unknown Student',
      username: a.userId?.username || 'user',
      email: a.userId?.email || '',
      photo: a.userId?.photo || '',
    },
    quiz: {
      id: a.quizId?._id?.toString() || a.quizId,
      title: a.title || a.quizId?.title || 'Examination',
      category: a.category || a.quizId?.category || 'General',
    },
    difficulty: a.difficulty || 'Medium',
    totalQuestions: a.questionSnapshot?.length || a.result?.perQuestion?.length || 0,
    correctAnswers: a.result?.correct || 0,
    wrongAnswers: a.result?.wrong || 0,
    skippedAnswers: a.result?.skipped || 0,
    totalMarks: a.result?.maximum || 0,
    obtainedMarks: a.result?.marks || 0,
    percentage: Math.round(a.result?.percent || 0),
    passed: a.passed,
    grade: a.grade,
    timeTakenSeconds: a.timeTakenSeconds || 0,
    submittedAt: a.submittedAt,
  }));

  return sendSuccess(res, formatPaginatedResponse(items, total, page, limit), 'Results retrieved.');
});

export const getResultDetail = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id)
    .populate('userId', 'name username email photo')
    .populate('quizId', 'title description category passingScore')
    .lean();

  if (!attempt) {
    const error = new Error('Result record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Format question-by-question analysis
  const questionsAnalysis = (attempt.result?.perQuestion || []).map((q, idx) => {
    const isCorrect = q.outcome === 'correct';
    const isSkipped = q.outcome === 'skipped' || q.selected === null || q.selected === undefined;
    return {
      index: idx + 1,
      questionId: q.questionId,
      text: q.text,
      options: q.options || [],
      selectedOptionIndex: q.selected,
      studentAnswer: q.options?.[q.selected] || (isSkipped ? 'Skipped' : 'None'),
      correctOptionIndex: q.correctIndex,
      correctAnswer: q.options?.[q.correctIndex] || '',
      explanation: q.explanation || '',
      outcome: isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong',
      marksGained: q.gained || 0,
    };
  });

  const detail = {
    id: attempt._id.toString(),
    student: {
      id: attempt.userId?._id?.toString() || '',
      name: attempt.userId?.name || 'Student',
      username: attempt.userId?.username || 'candidate',
      email: attempt.userId?.email || '',
      photo: attempt.userId?.photo || '',
    },
    quiz: {
      id: attempt.quizId?._id?.toString() || '',
      title: attempt.title,
      category: attempt.category,
      passingScore: attempt.passingScore,
    },
    scoreCard: {
      obtainedMarks: attempt.result?.marks || 0,
      totalMarks: attempt.result?.maximum || 0,
      percentage: Math.round(attempt.result?.percent || 0),
      correct: attempt.result?.correct || 0,
      wrong: attempt.result?.wrong || 0,
      skipped: attempt.result?.skipped || 0,
      timeTakenSeconds: attempt.timeTakenSeconds || 0,
      passed: attempt.passed,
      grade: attempt.grade,
      submittedAt: attempt.submittedAt,
    },
    questionsAnalysis,
  };

  return sendSuccess(res, detail, 'Detailed result analysis retrieved.');
});

export const deleteResult = asyncHandler(async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) {
    const error = new Error('Result record not found.');
    error.statusCode = 404;
    throw error;
  }

  await Attempt.findByIdAndDelete(req.params.id);

  await activityService.logActivity({
    type: 'quiz_deleted',
    message: `Attempt result for '${attempt.title}' was deleted by admin.`,
    userId: req.user?.id,
    userName: req.user?.name || 'Administrator',
    userRole: 'admin',
  });

  return sendSuccess(res, { success: true }, 'Result attempt record deleted.');
});

// -------------------------------------------------------------
// 4. Leaderboard, Reports & Activity Feed
// -------------------------------------------------------------
export const getAdminLeaderboard = asyncHandler(async (req, res) => {
  const { period = 'all', category } = req.query;
  const match = {};

  if (period === 'weekly') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    match.submittedAt = { $gte: sevenDaysAgo };
  } else if (period === 'monthly') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    match.submittedAt = { $gte: thirtyDaysAgo };
  }

  if (category && category !== 'all') {
    match.category = category;
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        totalMarks: { $sum: '$result.marks' },
        avgScore: { $avg: '$result.percent' },
        highestScore: { $max: '$result.percent' },
        passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        distinctQuizzes: { $addToSet: '$quizId' },
      },
    },
    { $sort: { avgScore: -1, totalMarks: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: '$user.name',
        username: '$user.username',
        email: '$user.email',
        photo: '$user.photo',
        totalQuizzes: { $size: '$distinctQuizzes' },
        totalAttempts: 1,
        avgScore: { $round: ['$avgScore', 1] },
        highestScore: { $round: ['$highestScore', 1] },
        passRate: {
          $round: [
            {
              $multiply: [{ $divide: ['$passedCount', { $cond: [{ $eq: ['$totalAttempts', 0] }, 1, '$totalAttempts'] }] }, 100],
            },
            1,
          ],
        },
        points: { $multiply: [{ $round: ['$avgScore', 0] }, 15] },
      },
    },
  ];

  const rankings = await Attempt.aggregate(pipeline);

  const formattedRankings = rankings.map((r, idx) => ({
    rank: idx + 1,
    ...r,
    badge: idx === 0 ? 'Gold Master' : idx === 1 ? 'Silver Scholar' : idx === 2 ? 'Bronze Achiever' : 'Honor Roll',
  }));

  return sendSuccess(res, { rankings: formattedRankings }, 'Leaderboard rankings retrieved.');
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await activityService.getActivityLogs(req.query);
  return sendSuccess(res, logs, 'Activity logs retrieved.');
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifs = await notificationService.getAdminNotifications(req.query);
  return sendSuccess(res, notifs, 'Notifications retrieved.');
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id);
  return sendSuccess(res, result, 'Notification updated.');
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id);
  return sendSuccess(res, result, 'Notification deleted.');
});

export const getReportsData = asyncHandler(async (req, res) => {
  const { reportType = 'students', dateFrom, dateTo, category } = req.query;

  const match = {};
  if (dateFrom || dateTo) {
    match.submittedAt = {};
    if (dateFrom) match.submittedAt.$gte = new Date(dateFrom);
    if (dateTo) match.submittedAt.$lte = new Date(dateTo);
  }
  if (category && category !== 'all') {
    match.category = category;
  }

  if (reportType === 'students') {
    const students = await User.find({ role: 'user' }).select('name username email status joinedAt').lean();
    const attemptsAgg = await Attempt.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userId',
          attemptsCount: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          highestScore: { $max: '$result.percent' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]);

    const map = new Map();
    attemptsAgg.forEach((a) => map.set(a._id.toString(), a));

    const rows = students.map((s) => {
      const st = map.get(s._id.toString()) || { attemptsCount: 0, avgScore: 0, highestScore: 0, passedCount: 0 };
      return {
        Student_Name: s.name,
        Username: `@${s.username}`,
        Email: s.email,
        Status: s.status,
        Total_Attempts: st.attemptsCount,
        Average_Score_Percent: Math.round((st.avgScore || 0) * 10) / 10,
        Highest_Score_Percent: Math.round((st.highestScore || 0) * 10) / 10,
        Pass_Rate: st.attemptsCount > 0 ? `${Math.round((st.passedCount / st.attemptsCount) * 100)}%` : '0%',
        Registration_Date: new Date(s.joinedAt).toLocaleDateString(),
      };
    });

    return sendSuccess(res, { reportType, rows, generatedAt: new Date().toISOString() }, 'Report generated.');
  }

  if (reportType === 'quizzes') {
    const quizzes = await Quiz.find().select('title category difficulty status passingScore').lean();
    const attemptsAgg = await Attempt.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$quizId',
          attemptsCount: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]);

    const map = new Map();
    attemptsAgg.forEach((a) => map.set(a._id.toString(), a));

    const rows = quizzes.map((q) => {
      const st = map.get(q._id.toString()) || { attemptsCount: 0, avgScore: 0, passedCount: 0 };
      return {
        Quiz_Title: q.title,
        Category: q.category,
        Difficulty: q.difficulty,
        Status: q.status,
        Passing_Score: `${q.passingScore}%`,
        Total_Attempts: st.attemptsCount,
        Average_Score_Percent: Math.round((st.avgScore || 0) * 10) / 10,
        Pass_Rate: st.attemptsCount > 0 ? `${Math.round((st.passedCount / st.attemptsCount) * 100)}%` : '0%',
      };
    });

    return sendSuccess(res, { reportType, rows, generatedAt: new Date().toISOString() }, 'Report generated.');
  }

  // Default: Marks Report
  const attempts = await Attempt.find(match)
    .populate('userId', 'name email')
    .sort({ submittedAt: -1 })
    .limit(500)
    .lean();

  const rows = attempts.map((a) => ({
    Candidate_Name: a.userId?.name || 'Unknown',
    Email: a.userId?.email || '',
    Quiz_Title: a.title,
    Category: a.category,
    Score_Obtained: a.result?.marks || 0,
    Total_Marks: a.result?.maximum || 0,
    Percentage: `${Math.round(a.result?.percent || 0)}%`,
    Outcome: a.passed ? 'PASS' : 'FAIL',
    Grade: a.grade,
    Duration_Seconds: a.timeTakenSeconds,
    Attempt_Date: new Date(a.submittedAt).toLocaleDateString(),
  }));

  return sendSuccess(res, { reportType, rows, generatedAt: new Date().toISOString() }, 'Report generated.');
});

export const getUserAttempts = asyncHandler(async (req, res) => {
  const result = await attemptService.getAttemptsByUser(req.params.id, req.query);
  return sendSuccess(res, result, 'User attempt history retrieved.');
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getSystemSettings();
  return sendSuccess(res, settings, 'System settings retrieved.');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updated = await settingService.updateSystemSettings(req.body);
  await activityService.logActivity({
    type: 'system_setting_updated',
    message: 'Global system configuration settings updated by administrator.',
    userId: req.user?.id,
    userName: req.user?.name || 'Administrator',
    userRole: 'admin',
  });
  return sendSuccess(res, updated, 'System settings saved successfully.');
});

export const globalSearch = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return sendSuccess(res, { students: [], quizzes: [], questions: [], results: [] }, 'Search query too short.');
  }

  const regex = { $regex: query, $options: 'i' };

  const [students, quizzes, questions, attempts] = await Promise.all([
    User.find({
      role: 'user',
      $or: [{ name: regex }, { username: regex }, { email: regex }],
    })
      .select('name username email photo status')
      .limit(6)
      .lean(),

    Quiz.find({
      $or: [{ title: regex }, { category: regex }, { tags: regex }],
    })
      .select('title category difficulty status passingScore durationMinutes')
      .limit(6)
      .lean(),

    Question.find({
      $or: [{ text: regex }, { category: regex }, { tags: regex }],
    })
      .select('text category difficulty marks type')
      .limit(6)
      .lean(),

    Attempt.find({
      $or: [{ title: regex }, { category: regex }],
    })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return sendSuccess(
    res,
    {
      students: students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        username: s.username,
        email: s.email,
        photo: s.photo,
        status: s.status,
        url: `/admin/users/${s._id}`,
      })),
      quizzes: quizzes.map((q) => ({
        id: q._id.toString(),
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        status: q.status,
        url: `/admin/quiz/${q._id}/edit`,
      })),
      questions: questions.map((qn) => ({
        id: qn._id.toString(),
        text: qn.text,
        category: qn.category,
        difficulty: qn.difficulty,
        marks: qn.marks,
        type: qn.type,
        url: `/admin/question/${qn._id}/edit`,
      })),
      results: attempts.map((a) => ({
        id: a._id.toString(),
        studentName: a.userId?.name || 'Student',
        quizTitle: a.title,
        category: a.category,
        percent: Math.round(a.result?.percent || 0),
        passed: a.passed,
        url: `/admin/results/${a._id}`,
      })),
    },
    'Global search results.'
  );
});

// -------------------------------------------------------------
// 5. Student Groups & Cohorts Management
// -------------------------------------------------------------
export const listStudentGroups = asyncHandler(async (req, res) => {
  const groups = await studentGroupService.listGroups();
  return sendSuccess(res, groups, 'Student groups retrieved.');
});

export const createStudentGroup = asyncHandler(async (req, res) => {
  const group = await studentGroupService.createGroup(req.body, req.user);
  return sendSuccess(res, group, 'Student group created successfully.', 201);
});

export const updateStudentGroup = asyncHandler(async (req, res) => {
  const group = await studentGroupService.updateGroup(req.params.id, req.body, req.user);
  return sendSuccess(res, group, 'Student group updated successfully.');
});

export const deleteStudentGroup = asyncHandler(async (req, res) => {
  const result = await studentGroupService.deleteGroup(req.params.id, req.user);
  return sendSuccess(res, result, 'Student group deleted.');
});

export const addStudentsToGroup = asyncHandler(async (req, res) => {
  const group = await studentGroupService.addStudentsToGroup(req.params.id, req.body.studentIds, req.user);
  return sendSuccess(res, group, 'Students added to cohort.');
});

export const removeStudentFromGroup = asyncHandler(async (req, res) => {
  const group = await studentGroupService.removeStudentFromGroup(req.params.id, req.params.studentId, req.user);
  return sendSuccess(res, group, 'Student removed from cohort.');
});

export const assignQuizzesToGroup = asyncHandler(async (req, res) => {
  const group = await studentGroupService.assignQuizzesToGroup(req.params.id, req.body.quizIds, req.user);
  return sendSuccess(res, group, 'Quizzes assigned to cohort.');
});

// -------------------------------------------------------------
// 6. Student Achievements & Gamification
// -------------------------------------------------------------
export const listAchievements = asyncHandler(async (req, res) => {
  await achievementService.seedDefaultAchievements();
  const achievements = await achievementService.listAchievements();
  return sendSuccess(res, achievements, 'Achievements retrieved.');
});

export const createAchievement = asyncHandler(async (req, res) => {
  const achievement = await achievementService.createAchievement(req.body, req.user);
  return sendSuccess(res, achievement, 'Achievement created successfully.', 201);
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await achievementService.updateAchievement(req.params.id, req.body, req.user);
  return sendSuccess(res, achievement, 'Achievement updated successfully.');
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const result = await achievementService.deleteAchievement(req.params.id, req.user);
  return sendSuccess(res, result, 'Achievement deleted.');
});

export const assignAchievement = asyncHandler(async (req, res) => {
  const result = await achievementService.assignAchievementToStudent(req.params.id, req.body.studentId, req.user);
  return sendSuccess(res, result, 'Achievement awarded to student.');
});

// -------------------------------------------------------------
// 7. Digital Certificate Management
// -------------------------------------------------------------
export const listCertificates = asyncHandler(async (req, res) => {
  const certs = await certificateService.listCertificates(req.query);
  return sendSuccess(res, certs, 'Certificates list retrieved.');
});

export const getCertificateDetail = asyncHandler(async (req, res) => {
  const cert = await certificateService.getCertificateById(req.params.id);
  return sendSuccess(res, cert, 'Certificate details retrieved.');
});

export const createCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.createCertificate(req.body, req.user);
  return sendSuccess(res, cert, 'Certificate issued successfully.', 201);
});

export const revokeCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.revokeCertificate(req.params.id, req.body.reason, req.user);
  return sendSuccess(res, cert, 'Certificate revoked successfully.');
});

export const reissueCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.reissueCertificate(req.params.id, req.body, req.user);
  return sendSuccess(res, cert, 'Replacement certificate reissued successfully.', 201);
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByIdAndDelete(req.params.id);
  if (!cert) {
    const err = new Error('Certificate not found.');
    err.statusCode = 404;
    throw err;
  }
  return sendSuccess(res, { success: true }, 'Certificate removed.');
});

export const getStudentCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ studentId: req.params.id })
    .populate('templateId')
    .sort({ issueDate: -1 })
    .lean();
  return sendSuccess(res, certs, 'Student certificates retrieved.');
});

export const bulkActionStudents = asyncHandler(async (req, res) => {
  const { studentIds = [], action, groupId } = req.body;
  if (!studentIds || studentIds.length === 0) {
    const err = new Error('No students selected for bulk operation.');
    err.statusCode = 400;
    throw err;
  }

  if (action === 'activate') {
    await User.updateMany({ _id: { $in: studentIds }, role: 'user' }, { status: 'active' });
  } else if (action === 'suspend') {
    await User.updateMany({ _id: { $in: studentIds }, role: 'user' }, { status: 'blocked' });
  } else if (action === 'assign_group' && groupId) {
    await studentGroupService.addStudentsToGroup(groupId, studentIds, req.user);
  }

  return sendSuccess(res, { count: studentIds.length }, `Bulk action '${action}' applied to ${studentIds.length} student(s).`);
});

// -------------------------------------------------------------
// 8. Certificate Templates & Requests
// -------------------------------------------------------------
export const listCertificateTemplates = asyncHandler(async (req, res) => {
  await certificateService.seedDefaultTemplates();
  const templates = await certificateService.listTemplates();
  return sendSuccess(res, templates, 'Certificate templates retrieved.');
});

export const createCertificateTemplate = asyncHandler(async (req, res) => {
  const template = await certificateService.createTemplate(req.body, req.user);
  return sendSuccess(res, template, 'Certificate template created.', 201);
});

export const updateCertificateTemplate = asyncHandler(async (req, res) => {
  const template = await certificateService.updateTemplate(req.params.id, req.body, req.user);
  return sendSuccess(res, template, 'Certificate template updated.');
});

export const deleteCertificateTemplate = asyncHandler(async (req, res) => {
  const result = await certificateService.deleteTemplate(req.params.id, req.user);
  return sendSuccess(res, result, 'Certificate template deleted.');
});

export const listCertificateRequests = asyncHandler(async (req, res) => {
  const requests = await certificateRequestService.listRequests(req.query);
  return sendSuccess(res, requests, 'Certificate requests retrieved.');
});

export const approveCertificateRequest = asyncHandler(async (req, res) => {
  const result = await certificateRequestService.approveRequest(req.params.id, req.user);
  return sendSuccess(res, result, 'Certificate request approved and issued.');
});

export const rejectCertificateRequest = asyncHandler(async (req, res) => {
  const result = await certificateRequestService.rejectRequest(req.params.id, req.body.reason, req.user);
  return sendSuccess(res, result, 'Certificate request rejected.');
});

export const getCertificateAnalytics = asyncHandler(async (req, res) => {
  const analytics = await certificateService.getCertificateAnalytics();
  return sendSuccess(res, analytics, 'Certificate analytics aggregated.');
});

export default {
  getDashboardKPIs,
  getMetrics,
  getAnalyticsDetailed,
  getAiInsights,
  listUsers,
  getStudentDetail,
  getStudentProgress,
  compareStudents,
  updateUserStatus,
  deleteUser,
  bulkActionStudents,
  getStudentCertificates,
  listResults,
  getResultDetail,
  deleteResult,
  getAdminLeaderboard,
  getActivityLogs,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getReportsData,
  getUserAttempts,
  getSettings,
  updateSettings,
  globalSearch,
  listStudentGroups,
  createStudentGroup,
  updateStudentGroup,
  deleteStudentGroup,
  addStudentsToGroup,
  removeStudentFromGroup,
  assignQuizzesToGroup,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  assignAchievement,
  listCertificates,
  getCertificateDetail,
  createCertificate,
  revokeCertificate,
  reissueCertificate,
  deleteCertificate,
  listCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  listCertificateRequests,
  approveCertificateRequest,
  rejectCertificateRequest,
  getCertificateAnalytics,
};


