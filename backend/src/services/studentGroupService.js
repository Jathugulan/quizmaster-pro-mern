import StudentGroup from '../models/StudentGroup.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import Certificate from '../models/Certificate.js';
import { logActivity } from './activityService.js';

export const listGroups = async () => {
  const groups = await StudentGroup.find()
    .populate('studentIds', 'name email username photo')
    .populate('quizIds', 'title category difficulty passingScore')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Aggregate stats per group
  const groupStats = await Promise.all(
    groups.map(async (g) => {
      const studentIds = (g.studentIds || []).map((s) => s._id || s);
      const [attemptsAgg, certsCount] = await Promise.all([
        Attempt.aggregate([
          { $match: { userId: { $in: studentIds } } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              avgScore: { $avg: '$result.percent' },
              passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
            },
          },
        ]),
        Certificate.countDocuments({ studentId: { $in: studentIds }, status: 'issued' }),
      ]);

      const st = attemptsAgg[0] || { totalAttempts: 0, avgScore: 0, passedCount: 0 };
      const totalStudents = studentIds.length;
      const passRate = st.totalAttempts > 0 ? Math.round((st.passedCount / st.totalAttempts) * 100) : 0;
      const completionRate = totalStudents > 0 ? Math.min(100, Math.round((st.totalAttempts / (totalStudents * Math.max(1, (g.quizIds || []).length))) * 100)) : 0;

      return {
        id: g._id.toString(),
        name: g.name,
        description: g.description,
        totalStudents,
        students: g.studentIds,
        assignedQuizzes: g.quizIds,
        avgScore: Math.round((st.avgScore || 0) * 10) / 10,
        passRate,
        completionRate,
        certificatesEarned: certsCount,
        createdAt: g.createdAt,
      };
    })
  );

  return groupStats;
};

export const createGroup = async (data, adminUser) => {
  const existing = await StudentGroup.findOne({ name: data.name.trim() });
  if (existing) {
    const err = new Error(`Group with name '${data.name}' already exists.`);
    err.statusCode = 400;
    throw err;
  }

  const group = await StudentGroup.create({
    name: data.name.trim(),
    description: data.description || '',
    studentIds: data.studentIds || [],
    quizIds: data.quizIds || [],
    createdBy: adminUser?.id,
  });

  if (data.studentIds?.length > 0) {
    await User.updateMany({ _id: { $in: data.studentIds } }, { $addToSet: { groups: group._id } });
  }

  await logActivity({
    type: 'group_created',
    message: `Student cohort '${group.name}' created by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return group;
};

export const updateGroup = async (id, data, adminUser) => {
  const group = await StudentGroup.findById(id);
  if (!group) {
    const err = new Error('Student group not found.');
    err.statusCode = 404;
    throw err;
  }

  if (data.name) group.name = data.name.trim();
  if (data.description !== undefined) group.description = data.description;
  if (data.studentIds !== undefined) group.studentIds = data.studentIds;
  if (data.quizIds !== undefined) group.quizIds = data.quizIds;

  await group.save();

  await logActivity({
    type: 'group_updated',
    message: `Student cohort '${group.name}' updated by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return group;
};

export const deleteGroup = async (id, adminUser) => {
  const group = await StudentGroup.findByIdAndDelete(id);
  if (!group) {
    const err = new Error('Student group not found.');
    err.statusCode = 404;
    throw err;
  }

  await User.updateMany({ groups: id }, { $pull: { groups: id } });

  await logActivity({
    type: 'group_deleted',
    message: `Student cohort '${group.name}' deleted by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return { success: true, message: `Group '${group.name}' deleted.` };
};

export const addStudentsToGroup = async (groupId, studentIds = [], adminUser) => {
  const group = await StudentGroup.findByIdAndUpdate(
    groupId,
    { $addToSet: { studentIds: { $each: studentIds } } },
    { new: true }
  );

  await User.updateMany({ _id: { $in: studentIds } }, { $addToSet: { groups: groupId } });
  return group;
};

export const removeStudentFromGroup = async (groupId, studentId, adminUser) => {
  const group = await StudentGroup.findByIdAndUpdate(
    groupId,
    { $pull: { studentIds: studentId } },
    { new: true }
  );

  await User.findByIdAndUpdate(studentId, { $pull: { groups: groupId } });
  return group;
};

export const assignQuizzesToGroup = async (groupId, quizIds = [], adminUser) => {
  const group = await StudentGroup.findByIdAndUpdate(
    groupId,
    { $addToSet: { quizIds: { $each: quizIds } } },
    { new: true }
  );
  return group;
};

export default {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  removeStudentFromGroup,
  assignQuizzesToGroup,
};
