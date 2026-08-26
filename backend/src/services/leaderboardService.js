import mongoose from 'mongoose';
import Attempt from '../models/Attempt.js';

export const getLeaderboard = async (query = {}) => {
  const scope = query.scope || 'global';
  const quizId = query.quizId;
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));

  const match = {};

  // Time scope filter
  const now = new Date();
  if (scope === 'weekly') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    match.submittedAt = { $gte: oneWeekAgo };
  } else if (scope === 'monthly') {
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    match.submittedAt = { $gte: oneMonthAgo };
  }

  // Quiz-specific filter
  if (quizId && mongoose.Types.ObjectId.isValid(quizId)) {
    match.quizId = new mongoose.Types.ObjectId(quizId);
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$result.percent' },
        bestScore: { $max: '$result.percent' },
        totalPassed: {
          $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] },
        },
        lastActive: { $max: '$submittedAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    // Exclude blocked users or non-student roles if needed
    { $match: { 'user.status': 'active', 'user.role': 'user' } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        username: '$user.username',
        photo: '$user.photo',
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 1] },
        bestScore: { $round: ['$bestScore', 1] },
        totalPassed: 1,
        lastActive: 1,
      },
    },
    { $sort: { averageScore: -1, totalAttempts: -1 } },
    { $limit: limit },
  ];

  const results = await Attempt.aggregate(pipeline);

  // Attach ranking positions
  const ranked = results.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  return {
    scope,
    quizId: quizId || null,
    leaderboard: ranked,
  };
};

export default { getLeaderboard };
