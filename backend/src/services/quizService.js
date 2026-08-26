import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';
import Attempt from '../models/Attempt.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import { logActivity } from './activityService.js';

export const listQuizzes = async (query = {}, userRole = 'user') => {
  const { page, limit, skip } = getPagination(query, 12, 100);
  const filter = {};

  // For students and guests, strictly show published quizzes
  if (userRole !== 'admin') {
    filter.status = 'published';
  } else if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.category && query.category !== 'all') {
    filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
  }

  if (query.subject && query.subject !== 'all') {
    filter.subject = new RegExp(`^${query.subject.trim()}$`, 'i');
  }

  if (query.course && query.course !== 'all') {
    filter.course = new RegExp(`^${query.course.trim()}$`, 'i');
  }

  if (query.categoryId && mongoose.Types.ObjectId.isValid(query.categoryId)) {
    filter.categoryId = query.categoryId;
  }

  if (query.difficulty && query.difficulty !== 'all') {
    filter.difficulty = new RegExp(`^${query.difficulty.trim()}$`, 'i');
  }

  if (query.featured !== undefined && query.featured !== '') {
    filter.featured = query.featured === 'true' || query.featured === true;
  }

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { shortDescription: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { subject: { $regex: s, $options: 'i' } },
      { course: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const sortDirection = query.order === 'asc' ? 1 : -1;
  const sortField = query.sortBy || 'createdAt';
  const sortObj = { [sortField]: sortDirection };

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(filter),
  ]);

  // Aggregate attempt statistics (attempts count, average score) for the quizzes
  const quizIds = quizzes.map((q) => q._id);
  const attemptAgg = await Attempt.aggregate([
    { $match: { quizId: { $in: quizIds } } },
    {
      $group: {
        _id: '$quizId',
        attemptsCount: { $sum: 1 },
        avgScore: { $avg: '$result.percent' },
        passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
      },
    },
  ]);

  const statsMap = new Map();
  attemptAgg.forEach((s) => {
    statsMap.set(s._id.toString(), {
      attemptsCount: s.attemptsCount,
      avgScore: Math.round(s.avgScore * 10) / 10,
      passRate: s.attemptsCount > 0 ? Math.round((s.passedCount / s.attemptsCount) * 100) : 0,
    });
  });

  const formatted = quizzes.map((q) => {
    const st = statsMap.get(q._id.toString()) || { attemptsCount: 0, avgScore: 0, passRate: 0 };
    return {
      id: q._id.toString(),
      title: q.title,
      shortDescription: q.shortDescription || '',
      description: q.description || '',
      thumbnailUrl: q.thumbnailUrl || '',
      tags: q.tags || [],
      category: q.category,
      subject: q.subject || '',
      course: q.course || '',
      language: q.language || 'English',
      instructions: q.instructions || '',
      categoryId: q.categoryId ? q.categoryId.toString() : undefined,
      difficulty: q.difficulty,
      durationSeconds: q.durationSeconds,
      timeLimit: q.timeLimit || Math.round((q.durationSeconds || 600) / 60),
      passingScore: q.passingScore,
      passingPercentage: q.passingPercentage ?? q.passingScore ?? 50,
      certificatePercentage: q.certificatePercentage ?? 80,
      totalMarks: q.totalMarks || (q.questionIds ? q.questionIds.length : 0),
      totalQuestions: q.totalQuestions || (q.questionIds || []).length,
      questionCount: (q.questionIds || []).length,
      questionIds: userRole === 'admin' ? q.questionIds.map((id) => id.toString()) : undefined,
      status: q.status,
      featured: Boolean(q.featured),
      settings: q.settings,
      attemptsCount: st.attemptsCount,
      averageScore: st.avgScore,
      passRate: st.passRate,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    };
  });

  return formatPaginatedResponse(formatted, total, page, limit);
};

export const getQuizById = async (id, userRole = 'user') => {
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }
  const quiz = await Quiz.findById(id).lean();
  if (!quiz) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'admin' && quiz.status !== 'published') {
    const error = new Error('Quiz is not currently available.');
    error.statusCode = 404;
    throw error;
  }

  // Load questions
  const questions = await Question.find({
    _id: { $in: quiz.questionIds },
    ...(userRole !== 'admin' ? { isActive: true } : {}),
  }).sort({ order: 1, createdAt: 1 }).lean();

  // If student: hide correct answers and explanations before exam session starts
  const safeQuestions = questions.map((q) => {
    const item = {
      id: q._id.toString(),
      text: q.text,
      imageUrl: q.imageUrl || '',
      category: q.category,
      subject: q.subject || '',
      course: q.course || '',
      difficulty: q.difficulty,
      type: q.type || 'multiple-choice',
      options: q.options,
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      order: q.order || 0,
      tags: q.tags || [],
      isActive: q.isActive,
    };

    if (userRole === 'admin') {
      item.correctIndex = q.correctIndex;
      item.correctIndices = q.correctIndices || [];
      item.explanation = q.explanation;
    }

    return item;
  });

  return {
    id: quiz._id.toString(),
    title: quiz.title,
    shortDescription: quiz.shortDescription || '',
    description: quiz.description,
    thumbnailUrl: quiz.thumbnailUrl || '',
    tags: quiz.tags || [],
    category: quiz.category,
    subject: quiz.subject || '',
    course: quiz.course || '',
    language: quiz.language || 'English',
    instructions: quiz.instructions || '',
    categoryId: quiz.categoryId ? quiz.categoryId.toString() : undefined,
    difficulty: quiz.difficulty,
    durationSeconds: quiz.durationSeconds,
    timeLimit: quiz.timeLimit || Math.round((quiz.durationSeconds || 600) / 60),
    passingScore: quiz.passingScore,
    passingPercentage: quiz.passingPercentage ?? quiz.passingScore ?? 50,
    certificatePercentage: quiz.certificatePercentage ?? 80,
    totalMarks: quiz.totalMarks || safeQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    totalQuestions: safeQuestions.length,
    questionCount: safeQuestions.length,
    questions: safeQuestions,
    questionIds: quiz.questionIds.map((qid) => qid.toString()),
    status: quiz.status,
    featured: Boolean(quiz.featured),
    settings: quiz.settings,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
};

export const createQuiz = async (data, adminUser) => {
  if (!data.title || !data.title.trim()) {
    const error = new Error('Quiz title is required.');
    error.statusCode = 422;
    throw error;
  }
  if (!data.category || !data.category.trim()) {
    const error = new Error('Category is required.');
    error.statusCode = 422;
    throw error;
  }

  const categoryDoc = await Category.findOne({ name: data.category.trim() });
  const durationSec = Number(data.durationSeconds) || (Number(data.timeLimit) ? Number(data.timeLimit) * 60 : 600);
  const timeLimitMins = Number(data.timeLimit) || Math.round(durationSec / 60);

  // If inline questions are provided in Step 3, author and persist them
  let questionIds = Array.isArray(data.questionIds) ? [...data.questionIds] : [];
  let calculatedTotalMarks = Number(data.totalMarks) || 0;

  if (Array.isArray(data.questions) && data.questions.length > 0) {
    const createdQuestionDocs = await Promise.all(
      data.questions.map(async (q, index) => {
        if (q.id && mongoose.Types.ObjectId.isValid(q.id)) {
          // Update existing question
          await Question.findByIdAndUpdate(q.id, {
            text: q.text,
            imageUrl: q.imageUrl || '',
            category: data.category.trim(),
            subject: data.subject || '',
            course: data.course || '',
            difficulty: q.difficulty || data.difficulty || 'Medium',
            type: q.type || 'multiple-choice',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B'],
            correctIndex: Number(q.correctIndex) || 0,
            correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
            marks: Number(q.marks) || 1,
            negativeMarks: Number(q.negativeMarks) || 0,
            explanation: q.explanation || '',
            order: index,
            tags: q.tags || data.tags || [],
            isActive: q.isActive !== false,
          });
          return q.id;
        } else {
          // Create new question
          const newDoc = await Question.create({
            text: q.text || 'Untitled Question',
            imageUrl: q.imageUrl || '',
            category: data.category.trim(),
            subject: data.subject || '',
            course: data.course || '',
            difficulty: q.difficulty || data.difficulty || 'Medium',
            type: q.type || 'multiple-choice',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B'],
            correctIndex: Number(q.correctIndex) || 0,
            correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
            marks: Number(q.marks) || 1,
            negativeMarks: Number(q.negativeMarks) || 0,
            explanation: q.explanation || '',
            order: index,
            tags: q.tags || data.tags || [],
            isActive: q.isActive !== false,
          });
          return newDoc._id.toString();
        }
      })
    );

    questionIds = createdQuestionDocs;
    calculatedTotalMarks = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  }

  // Pre-publish validation if published
  if (data.status === 'published') {
    if (questionIds.length === 0) {
      const error = new Error('Cannot publish a quiz with 0 questions. Please add questions first.');
      error.statusCode = 422;
      throw error;
    }
    if (durationSec < 60) {
      const error = new Error('Quiz duration must be at least 1 minute (60 seconds).');
      error.statusCode = 422;
      throw error;
    }
  }

  const quiz = await Quiz.create({
    title: data.title.trim(),
    shortDescription: data.shortDescription ? data.shortDescription.trim() : '',
    description: data.description ? data.description.trim() : '',
    thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl.trim() : (categoryDoc?.thumbnailUrl || ''),
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : (categoryDoc?.tags || []),
    category: data.category.trim(),
    subject: data.subject ? data.subject.trim() : '',
    course: data.course ? data.course.trim() : '',
    language: data.language ? data.language.trim() : 'English',
    instructions: data.instructions ? data.instructions.trim() : '',
    categoryId: categoryDoc?._id,
    difficulty: data.difficulty || 'Medium',
    durationSeconds: durationSec,
    timeLimit: timeLimitMins,
    passingScore: data.passingPercentage !== undefined ? Number(data.passingPercentage) : (data.passingScore !== undefined ? Number(data.passingScore) : 50),
    passingPercentage: data.passingPercentage !== undefined ? Number(data.passingPercentage) : (data.passingScore !== undefined ? Number(data.passingScore) : 50),
    certificatePercentage: data.certificatePercentage !== undefined ? Number(data.certificatePercentage) : 80,
    totalQuestions: questionIds.length,
    totalMarks: calculatedTotalMarks || questionIds.length,
    featured: Boolean(data.featured),
    questionIds: questionIds,
    status: data.status || 'draft',
    settings: {
      randomize: data.settings?.randomize ?? false,
      shuffleAnswers: data.settings?.shuffleAnswers ?? false,
      showExplanations: data.settings?.showExplanations ?? true,
      showResult: data.settings?.showResult ?? true,
      allowReview: data.settings?.allowReview ?? true,
      allowRetake: data.settings?.allowRetake ?? true,
      maxAttempts: Number(data.settings?.maxAttempts) || 0,
      randomizeQuestions: data.settings?.randomizeQuestions ?? false,
      randomizeOptions: data.settings?.randomizeOptions ?? false,
    },
    createdBy: adminUser?.id,
  });

  // Link quizId to all created questions
  if (questionIds.length > 0) {
    await Question.updateMany({ _id: { $in: questionIds } }, { quizId: quiz._id });
  }

  await logActivity({
    type: 'quiz_created',
    message: `Quiz '${quiz.title}' (${quiz.category}${quiz.subject ? ` / ${quiz.subject}` : ''}) created by administrator.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { quizId: quiz._id.toString() },
  });

  return getQuizById(quiz._id.toString(), 'admin');
};

export const updateQuiz = async (id, data, adminUser) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  if (data.title) quiz.title = data.title.trim();
  if (data.shortDescription !== undefined) quiz.shortDescription = data.shortDescription.trim();
  if (data.description !== undefined) quiz.description = data.description;
  if (data.thumbnailUrl !== undefined) quiz.thumbnailUrl = data.thumbnailUrl.trim();
  if (data.tags !== undefined) {
    quiz.tags = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  }
  if (data.category) {
    quiz.category = data.category.trim();
    const categoryDoc = await Category.findOne({ name: data.category.trim() });
    if (categoryDoc) quiz.categoryId = categoryDoc._id;
  }
  if (data.subject !== undefined) quiz.subject = data.subject.trim();
  if (data.course !== undefined) quiz.course = data.course.trim();
  if (data.language !== undefined) quiz.language = data.language.trim();
  if (data.instructions !== undefined) quiz.instructions = data.instructions.trim();
  if (data.difficulty) quiz.difficulty = data.difficulty;

  if (data.timeLimit !== undefined) {
    quiz.timeLimit = Number(data.timeLimit);
    quiz.durationSeconds = Number(data.timeLimit) * 60;
  } else if (data.durationSeconds !== undefined) {
    quiz.durationSeconds = Number(data.durationSeconds);
    quiz.timeLimit = Math.round(Number(data.durationSeconds) / 60);
  }

  if (data.passingPercentage !== undefined) {
    quiz.passingPercentage = Number(data.passingPercentage);
    quiz.passingScore = Number(data.passingPercentage);
  } else if (data.passingScore !== undefined) {
    quiz.passingScore = Number(data.passingScore);
    quiz.passingPercentage = Number(data.passingScore);
  }

  if (data.certificatePercentage !== undefined) {
    quiz.certificatePercentage = Number(data.certificatePercentage);
  }

  if (data.featured !== undefined) quiz.featured = Boolean(data.featured);

  // Handle inline questions update
  if (Array.isArray(data.questions)) {
    const updatedQuestionIds = await Promise.all(
      data.questions.map(async (q, index) => {
        if (q.id && mongoose.Types.ObjectId.isValid(q.id)) {
          await Question.findByIdAndUpdate(q.id, {
            quizId: quiz._id,
            text: q.text,
            imageUrl: q.imageUrl || '',
            category: quiz.category,
            subject: quiz.subject || '',
            course: quiz.course || '',
            difficulty: q.difficulty || quiz.difficulty || 'Medium',
            type: q.type || 'multiple-choice',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B'],
            correctIndex: Number(q.correctIndex) || 0,
            correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
            marks: Number(q.marks) || 1,
            negativeMarks: Number(q.negativeMarks) || 0,
            explanation: q.explanation || '',
            order: index,
            tags: q.tags || quiz.tags || [],
            isActive: q.isActive !== false,
          });
          return q.id;
        } else {
          const newDoc = await Question.create({
            quizId: quiz._id,
            text: q.text || 'Untitled Question',
            imageUrl: q.imageUrl || '',
            category: quiz.category,
            subject: quiz.subject || '',
            course: quiz.course || '',
            difficulty: q.difficulty || quiz.difficulty || 'Medium',
            type: q.type || 'multiple-choice',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B'],
            correctIndex: Number(q.correctIndex) || 0,
            correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
            marks: Number(q.marks) || 1,
            negativeMarks: Number(q.negativeMarks) || 0,
            explanation: q.explanation || '',
            order: index,
            tags: q.tags || quiz.tags || [],
            isActive: q.isActive !== false,
          });
          return newDoc._id.toString();
        }
      })
    );

    quiz.questionIds = updatedQuestionIds;
    quiz.totalQuestions = updatedQuestionIds.length;
    quiz.totalMarks = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  } else if (data.questionIds) {
    quiz.questionIds = data.questionIds;
    quiz.totalQuestions = data.questionIds.length;
    if (data.totalMarks !== undefined) quiz.totalMarks = Number(data.totalMarks);
  }

  if (data.status) {
    if (data.status === 'published') {
      if ((quiz.questionIds || []).length === 0) {
        const error = new Error('Cannot publish a quiz without questions. Please add questions first.');
        error.statusCode = 422;
        throw error;
      }
      if (quiz.durationSeconds < 60) {
        const error = new Error('Quiz duration must be at least 1 minute.');
        error.statusCode = 422;
        throw error;
      }
    }
    quiz.status = data.status;
  }

  if (data.settings) {
    quiz.settings = { ...quiz.settings.toObject(), ...data.settings };
  }

  await quiz.save();

  await logActivity({
    type: 'quiz_updated',
    message: `Quiz '${quiz.title}' updated by administrator.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { quizId: quiz._id.toString() },
  });

  return getQuizById(quiz._id.toString(), 'admin');
};

export const duplicateQuiz = async (id, adminUser) => {
  const original = await Quiz.findById(id).lean();
  if (!original) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  // Load original questions to clone them with fresh IDs
  const originalQuestions = await Question.find({ _id: { $in: original.questionIds } }).lean();

  const clonedQuestionDocs = await Promise.all(
    originalQuestions.map((q) =>
      Question.create({
        text: q.text,
        imageUrl: q.imageUrl || '',
        category: q.category,
        subject: q.subject || original.subject || '',
        course: q.course || original.course || '',
        difficulty: q.difficulty,
        type: q.type,
        options: [...q.options],
        correctIndex: q.correctIndex,
        correctIndices: q.correctIndices ? [...q.correctIndices] : [],
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        explanation: q.explanation,
        order: q.order || 0,
        tags: q.tags ? [...q.tags] : [],
        isActive: q.isActive,
      })
    )
  );

  const newQuestionIds = clonedQuestionDocs.map((doc) => doc._id);

  const duplicatedQuiz = await Quiz.create({
    title: `${original.title} (Copy)`,
    shortDescription: original.shortDescription || '',
    description: original.description,
    thumbnailUrl: original.thumbnailUrl || '',
    tags: original.tags || [],
    category: original.category,
    subject: original.subject || '',
    course: original.course || '',
    language: original.language || 'English',
    instructions: original.instructions || '',
    categoryId: original.categoryId,
    difficulty: original.difficulty,
    durationSeconds: original.durationSeconds,
    timeLimit: original.timeLimit || Math.round((original.durationSeconds || 600) / 60),
    passingScore: original.passingScore,
    passingPercentage: original.passingPercentage ?? original.passingScore ?? 50,
    certificatePercentage: original.certificatePercentage ?? 80,
    totalQuestions: newQuestionIds.length,
    totalMarks: original.totalMarks,
    featured: false,
    questionIds: newQuestionIds,
    status: 'draft',
    settings: { ...original.settings },
    createdBy: adminUser?.id,
  });

  await Question.updateMany({ _id: { $in: newQuestionIds } }, { quizId: duplicatedQuiz._id });

  await logActivity({
    type: 'quiz_created',
    message: `Quiz '${original.title}' duplicated into new draft '${duplicatedQuiz.title}'.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { originalId: id, duplicatedId: duplicatedQuiz._id.toString() },
  });

  return getQuizById(duplicatedQuiz._id.toString(), 'admin');
};

export const bulkQuizAction = async ({ action, quizIds, data = {} }, adminUser) => {
  if (!Array.isArray(quizIds) || quizIds.length === 0) {
    const error = new Error('No quiz IDs provided for bulk action.');
    error.statusCode = 422;
    throw error;
  }

  let result;
  switch (action) {
    case 'publish':
      result = await Quiz.updateMany({ _id: { $in: quizIds } }, { status: 'published' });
      break;
    case 'unpublish':
      result = await Quiz.updateMany({ _id: { $in: quizIds } }, { status: 'draft' });
      break;
    case 'archive':
      result = await Quiz.updateMany({ _id: { $in: quizIds } }, { status: 'archived' });
      break;
    case 'delete':
      // Clean up linked questions and attempts
      await Question.deleteMany({ quizId: { $in: quizIds } });
      await Attempt.deleteMany({ quizId: { $in: quizIds } });
      result = await Quiz.deleteMany({ _id: { $in: quizIds } });
      break;
    case 'setCategory':
      if (!data.category) {
        const error = new Error('Target category is required for bulk category change.');
        error.statusCode = 422;
        throw error;
      }
      const categoryDoc = await Category.findOne({ name: data.category.trim() });
      result = await Quiz.updateMany(
        { _id: { $in: quizIds } },
        { category: data.category.trim(), categoryId: categoryDoc?._id }
      );
      break;
    default: {
      const error = new Error(`Unsupported bulk action: '${action}'`);
      error.statusCode = 422;
      throw error;
    }
  }

  await logActivity({
    type: 'bulk_action',
    message: `Bulk action '${action}' applied to ${quizIds.length} quiz records.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { action, count: quizIds.length },
  });

  return { success: true, count: result.modifiedCount || result.deletedCount || 0 };
};

export const deleteQuiz = async (id, forceOrUser, maybeUser) => {
  const adminUser = maybeUser || (typeof forceOrUser === 'object' ? forceOrUser : null);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  // Delete attached questions & attempts
  await Question.deleteMany({ _id: { $in: quiz.questionIds } });
  await Question.deleteMany({ quizId: id });
  await Attempt.deleteMany({ quizId: id });
  await Quiz.findByIdAndDelete(id);

  await logActivity({
    type: 'quiz_deleted',
    message: `Quiz '${quiz.title}' was permanently deleted.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { quizId: id, title: quiz.title },
  });

  return { success: true, message: `Quiz '${quiz.title}' deleted successfully.` };
};

export default {
  listQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  duplicateQuiz,
  bulkQuizAction,
  deleteQuiz,
};
