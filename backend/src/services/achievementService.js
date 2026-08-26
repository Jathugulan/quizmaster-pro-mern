import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Attempt from '../models/Attempt.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';

export const listAchievements = async () => {
  const achievements = await Achievement.find().sort({ points: 1 }).lean();

  // Aggregate earned count per achievement
  const usersWithBadges = await User.find({ role: 'user' }).select('name badges').lean();

  return achievements.map((ach) => {
    const earnedCount = usersWithBadges.filter((u) => (u.badges || []).includes(ach.title)).length;
    return {
      id: ach._id.toString(),
      title: ach.title,
      description: ach.description,
      icon: ach.icon || 'Award',
      badgeColor: ach.badgeColor || '#0071e3',
      criteriaType: ach.criteriaType,
      criteriaValue: ach.criteriaValue,
      points: ach.points,
      isActive: ach.isActive,
      earnedCount,
    };
  });
};

export const createAchievement = async (data, adminUser) => {
  const ach = await Achievement.create(data);
  await logActivity({
    type: 'achievement_created',
    message: `New achievement badge '${ach.title}' created by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });
  return ach;
};

export const updateAchievement = async (id, data, adminUser) => {
  const ach = await Achievement.findByIdAndUpdate(id, data, { new: true });
  return ach;
};

export const deleteAchievement = async (id, adminUser) => {
  const ach = await Achievement.findByIdAndDelete(id);
  return { success: true, message: `Achievement '${ach?.title}' deleted.` };
};

export const assignAchievementToStudent = async (achievementId, studentId, adminUser) => {
  const [ach, student] = await Promise.all([
    Achievement.findById(achievementId),
    User.findById(studentId),
  ]);

  if (!ach || !student) {
    const err = new Error('Achievement or Student profile not found.');
    err.statusCode = 404;
    throw err;
  }

  await User.findByIdAndUpdate(studentId, {
    $addToSet: { badges: ach.title },
    $inc: { points: ach.points || 50 },
  });

  await createNotification({
    title: `🏆 New Achievement Unlocked: ${ach.title}`,
    message: `You earned the '${ach.title}' badge and +${ach.points} points! ${ach.description}`,
    type: 'achievement',
    targetRole: 'user',
    targetUserId: student._id.toString(),
  });

  await logActivity({
    type: 'achievement_assigned',
    message: `Achievement badge '${ach.title}' assigned to ${student.name} by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return { success: true, message: `Achievement '${ach.title}' awarded to ${student.name}.` };
};

export const seedDefaultAchievements = async () => {
  const count = await Achievement.countDocuments();
  if (count === 0) {
    await Achievement.create([
      {
        title: 'Quiz Master',
        description: 'Complete 10 examinations in any category.',
        icon: 'Trophy',
        badgeColor: '#0071e3',
        criteriaType: 'quiz_count',
        criteriaValue: 10,
        points: 100,
      },
      {
        title: 'High Performer',
        description: 'Score 90% or above on an accredited assessment.',
        icon: 'Star',
        badgeColor: '#15803d',
        criteriaType: 'score_threshold',
        criteriaValue: 90,
        points: 75,
      },
      {
        title: 'Quiz Streak Master',
        description: 'Maintain a learning streak of 7 consecutive days.',
        icon: 'Flame',
        badgeColor: '#b45309',
        criteriaType: 'streak_days',
        criteriaValue: 7,
        points: 150,
      },
      {
        title: 'Perfect Score',
        description: 'Attain a 100% flawless score on an examination.',
        icon: 'Target',
        badgeColor: '#7e22ce',
        criteriaType: 'perfect_score',
        criteriaValue: 100,
        points: 200,
      },
      {
        title: 'Knowledge Explorer',
        description: 'Attempt assessments across 5 distinct subject categories.',
        icon: 'Compass',
        badgeColor: '#0284c7',
        criteriaType: 'category_count',
        criteriaValue: 5,
        points: 120,
      },
      {
        title: 'Top Student',
        description: 'Ascend to Rank #1 on the platform leaderboard.',
        icon: 'Crown',
        badgeColor: '#d97706',
        criteriaType: 'rank_first',
        criteriaValue: 1,
        points: 300,
      },
    ]);
  }
};

export default {
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  assignAchievementToStudent,
  seedDefaultAchievements,
};
