import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import { logActivity } from './activityService.js';

export const listCategories = async ({
  includeCounts = true,
  activeOnly = false,
  search = '',
  featured,
  sortBy = 'displayOrder',
  order = 'asc',
  page,
  limit,
} = {}) => {
  const filter = {};
  if (activeOnly) {
    filter.isActive = true;
    filter.status = 'active';
  }
  if (featured !== undefined && featured !== '') {
    filter.featured = featured === 'true' || featured === true;
  }
  if (search && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  const sortDirection = order === 'desc' ? -1 : 1;
  const sortObj = {};
  if (sortBy === 'name') sortObj.name = sortDirection;
  else if (sortBy === 'createdAt') sortObj.createdAt = sortDirection;
  else {
    sortObj.displayOrder = sortDirection;
    sortObj.name = 1;
  }

  let query = Category.find(filter).sort(sortObj);
  let total = 0;
  if (page && limit) {
    total = await Category.countDocuments(filter);
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));
  }

  const categories = await query.lean();

  if (!includeCounts || categories.length === 0) {
    const formatted = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl || '',
      tags: c.tags || [],
      status: c.status || (c.isActive ? 'active' : 'inactive'),
      isActive: c.isActive !== false,
      displayOrder: c.displayOrder || 0,
      featured: Boolean(c.featured),
      icon: c.icon || 'BookOpen',
      color: c.color || '#0071e3',
      quizCount: 0,
      questionCount: 0,
      averageScore: 0,
      attemptsCount: 0,
      createdAt: c.createdAt,
    }));

    return page && limit
      ? { items: formatted, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
      : formatted;
  }

  // Aggregate quiz counts, question counts, and attempt stats across categories
  const [quizStats, questionStats, attemptStats] = await Promise.all([
    Quiz.aggregate([
      { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 }, publishedCount: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } } } },
    ]),
    Question.aggregate([
      { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
    ]),
    Attempt.aggregate([
      {
        $group: {
          _id: { $toLower: '$category' },
          avgScore: { $avg: '$result.percent' },
          attemptCount: { $sum: 1 },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]),
  ]);

  const quizMap = new Map();
  quizStats.forEach((s) => quizMap.set(String(s._id).toLowerCase(), { total: s.count, published: s.publishedCount }));

  const questionMap = new Map();
  questionStats.forEach((s) => questionMap.set(String(s._id).toLowerCase(), s.count));

  const attemptMap = new Map();
  attemptStats.forEach((s) => {
    const passRate = s.attemptCount > 0 ? Math.round((s.passedCount / s.attemptCount) * 100) : 0;
    attemptMap.set(String(s._id).toLowerCase(), {
      avgScore: Math.round(s.avgScore * 10) / 10,
      count: s.attemptCount,
      passedCount: s.passedCount,
      passRate,
    });
  });

  const formatted = categories.map((c) => {
    const key = c.name.toLowerCase();
    const qz = quizMap.get(key) || { total: 0, published: 0 };
    const qCount = questionMap.get(key) || 0;
    const att = attemptMap.get(key) || { avgScore: 0, count: 0, passedCount: 0, passRate: 0 };

    return {
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      thumbnailUrl: c.thumbnailUrl || '',
      tags: c.tags || [],
      status: c.status || (c.isActive ? 'active' : 'inactive'),
      isActive: c.isActive !== false,
      displayOrder: c.displayOrder || 0,
      featured: Boolean(c.featured),
      icon: c.icon || 'BookOpen',
      color: c.color || '#0071e3',
      quizCount: qz.total,
      publishedQuizCount: qz.published,
      questionCount: qCount,
      averageScore: att.avgScore,
      attemptsCount: att.count,
      passRate: att.passRate,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  });

  return page && limit
    ? { items: formatted, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    : formatted;
};

export const getCategoryById = async (id) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const filter = isObjectId ? { _id: id } : { slug: id };

  const category = await Category.findOne(filter).lean();
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  const categoryName = category.name;
  const key = categoryName.toLowerCase();

  // Aggregate statistics for this specific category
  const [quizzes, questionCount, attemptStats, studentCount] = await Promise.all([
    Quiz.find({ $or: [{ category: categoryName }, { categoryId: category._id }] })
      .select('title description difficulty durationSeconds passingScore status questionIds rating tags thumbnailUrl')
      .sort({ createdAt: -1 })
      .lean(),
    Question.countDocuments({ category: categoryName }),
    Attempt.aggregate([
      { $match: { category: categoryName } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$result.percent' },
          passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } },
          totalTime: { $sum: '$timeTakenSeconds' },
        },
      },
    ]),
    Attempt.distinct('userId', { category: categoryName }),
  ]);

  const attemptsData = attemptStats[0] || {
    totalAttempts: 0,
    avgScore: 0,
    passedAttempts: 0,
    totalTime: 0,
  };

  const passRate = attemptsData.totalAttempts > 0
    ? Math.round((attemptsData.passedAttempts / attemptsData.totalAttempts) * 100)
    : 0;

  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    thumbnailUrl: category.thumbnailUrl || '',
    tags: category.tags || [],
    status: category.status || (category.isActive ? 'active' : 'inactive'),
    isActive: category.isActive !== false,
    displayOrder: category.displayOrder || 0,
    featured: Boolean(category.featured),
    icon: category.icon || 'BookOpen',
    color: category.color || '#0071e3',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    stats: {
      totalQuizzes: quizzes.length,
      publishedQuizzes: quizzes.filter((q) => q.status === 'published').length,
      totalQuestions: questionCount,
      totalStudents: studentCount.length,
      totalAttempts: attemptsData.totalAttempts,
      averageScore: Math.round(attemptsData.avgScore * 10) / 10,
      passRate,
      averageDuration: attemptsData.totalAttempts > 0 ? Math.round(attemptsData.totalTime / attemptsData.totalAttempts) : 0,
    },
    quizzes: quizzes.map((q) => ({
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      thumbnailUrl: q.thumbnailUrl || '',
      tags: q.tags || [],
      difficulty: q.difficulty,
      durationSeconds: q.durationSeconds,
      passingScore: q.passingScore,
      questionCount: q.questionIds ? q.questionIds.length : 0,
      status: q.status,
      rating: q.rating || 4.8,
    })),
  };
};

export const getCategoryQuizzes = async (id, { status, search, difficulty, limit = 50 } = {}) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const category = await Category.findOne(isObjectId ? { _id: id } : { slug: id }).lean();
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  const filter = {
    $or: [{ category: category.name }, { categoryId: category._id }],
  };

  if (status && status !== 'all') {
    filter.status = status;
  }
  if (difficulty && difficulty !== 'all') {
    filter.difficulty = difficulty;
  }
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { tags: { $in: [new RegExp(search.trim(), 'i')] } },
    ];
  }

  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).lean();

  return quizzes.map((q) => ({
    id: q._id.toString(),
    title: q.title,
    description: q.description,
    category: q.category,
    thumbnailUrl: q.thumbnailUrl || category.thumbnailUrl || '',
    tags: q.tags || category.tags || [],
    difficulty: q.difficulty,
    durationSeconds: q.durationSeconds,
    passingScore: q.passingScore,
    questionCount: q.questionIds ? q.questionIds.length : 0,
    status: q.status,
    featured: Boolean(q.featured),
    createdAt: q.createdAt,
  }));
};

export const getCategoryAnalytics = async (id) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const category = await Category.findOne(isObjectId ? { _id: id } : { slug: id }).lean();
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  const categoryName = category.name;

  const [quizzes, attempts, difficultyStats] = await Promise.all([
    Quiz.find({ category: categoryName }).select('title difficulty status questionIds').lean(),
    Attempt.find({ category: categoryName }).select('quizId title result passed timeTakenSeconds submittedAt').sort({ submittedAt: -1 }).limit(200).lean(),
    Question.aggregate([
      { $match: { category: categoryName } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]),
  ]);

  const quizPerformance = quizzes.map((q) => {
    const quizAttempts = attempts.filter((a) => String(a.quizId) === String(q._id));
    const attCount = quizAttempts.length;
    const avgScore = attCount > 0 ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.result?.percent || 0), 0) / attCount) : 0;
    const passCount = quizAttempts.filter((a) => a.passed).length;
    const passRate = attCount > 0 ? Math.round((passCount / attCount) * 100) : 0;

    return {
      id: q._id.toString(),
      title: q.title,
      difficulty: q.difficulty,
      attemptsCount: attCount,
      averageScore: avgScore,
      passRate,
      status: q.status,
    };
  });

  return {
    category: {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      thumbnailUrl: category.thumbnailUrl || '',
    },
    totalQuizzes: quizzes.length,
    totalAttempts: attempts.length,
    difficultyBreakdown: difficultyStats.map((d) => ({ difficulty: d._id || 'Medium', count: d.count })),
    quizPerformance,
  };
};

export const createCategory = async (data, adminUser) => {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Category name is required.');
    error.statusCode = 422;
    throw error;
  }

  const name = data.name.trim();
  const slug = data.slug
    ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    const error = new Error(`Category '${name}' already exists.`);
    error.statusCode = 409;
    throw error;
  }

  const category = await Category.create({
    name,
    slug,
    description: data.description ? data.description.trim() : '',
    thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl.trim() : '',
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    status: data.status === 'inactive' ? 'inactive' : 'active',
    isActive: data.status === 'inactive' || data.isActive === false ? false : true,
    displayOrder: Number(data.displayOrder) || 0,
    featured: Boolean(data.featured),
    icon: data.icon || 'BookOpen',
    color: data.color || '#0071e3',
    createdBy: adminUser?.id,
  });

  await logActivity({
    type: 'quiz_created',
    message: `Assessment category '${category.name}' created by platform administrator.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { categoryId: category._id.toString() },
  });

  return category;
};

export const updateCategory = async (id, data, adminUser) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  const oldName = category.name;

  if (data.name && data.name.trim() !== category.name) {
    const newName = data.name.trim();
    const newSlug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const collision = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ name: newName }, { slug: newSlug }],
    });

    if (collision) {
      const error = new Error(`Category name '${newName}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    category.name = newName;
    category.slug = newSlug;

    // Propagate category name update to linked Quizzes, Questions, Attempts
    await Promise.all([
      Quiz.updateMany({ category: oldName }, { category: newName, categoryId: category._id }),
      Question.updateMany({ category: oldName }, { category: newName }),
      Attempt.updateMany({ category: oldName }, { category: newName }),
    ]);
  }

  if (data.description !== undefined) category.description = data.description.trim();
  if (data.thumbnailUrl !== undefined) category.thumbnailUrl = data.thumbnailUrl.trim();
  if (data.tags !== undefined) {
    category.tags = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  }
  if (data.status !== undefined) {
    category.status = data.status;
    category.isActive = data.status === 'active';
  }
  if (data.isActive !== undefined) {
    category.isActive = Boolean(data.isActive);
    category.status = category.isActive ? 'active' : 'inactive';
  }
  if (data.displayOrder !== undefined) category.displayOrder = Number(data.displayOrder) || 0;
  if (data.featured !== undefined) category.featured = Boolean(data.featured);
  if (data.icon !== undefined) category.icon = data.icon;
  if (data.color !== undefined) category.color = data.color;

  await category.save();

  await logActivity({
    type: 'quiz_updated',
    message: `Assessment category '${category.name}' updated by administrator.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { categoryId: category._id.toString() },
  });

  return category;
};

export const updateCategoryStatus = async (id, status, adminUser) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  const nextStatus = status === 'active' || status === true ? 'active' : 'inactive';
  category.status = nextStatus;
  category.isActive = nextStatus === 'active';
  await category.save();

  await logActivity({
    type: 'quiz_updated',
    message: `Assessment category '${category.name}' status changed to '${nextStatus}'.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return category;
};

export const deleteCategory = async (id, adminUser) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check if quizzes or questions are linked to prevent orphan records
  const [quizzesCount, questionsCount] = await Promise.all([
    Quiz.countDocuments({ $or: [{ category: category.name }, { categoryId: category._id }] }),
    Question.countDocuments({ category: category.name }),
  ]);

  if (quizzesCount > 0 || questionsCount > 0) {
    const error = new Error(
      `Cannot delete category '${category.name}' because it contains ${quizzesCount} quizzes and ${questionsCount} questions. Please reassign or delete these quizzes first, or deactivate the category.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(id);

  await logActivity({
    type: 'quiz_deleted',
    message: `Assessment category '${category.name}' deleted by administrator.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return { success: true, message: `Category '${category.name}' deleted successfully.` };
};

export const seedDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      {
        name: 'Web Development',
        description: 'Modern frontend and backend web architecture, modern ECMAScript standards, responsive design, React, Next.js, and REST APIs.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'REST API'],
        icon: 'Code',
        color: '#0071e3',
        displayOrder: 1,
        featured: true,
      },
      {
        name: 'Computer Science',
        description: 'Core computation theory, algorithmic design, discrete mathematics, memory architecture, operating systems, and computer hardware.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        tags: ['Algorithms', 'Data Structures', 'OS', 'CPU', 'Computer Architecture'],
        icon: 'Cpu',
        color: '#af52de',
        displayOrder: 2,
        featured: true,
      },
      {
        name: 'Database & Cloud',
        description: 'Relational & NoSQL database engineering, SQL queries, MongoDB Atlas indexing, cloud architecture, AWS, and distributed systems.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        tags: ['MongoDB', 'SQL', 'Cloud', 'PostgreSQL', 'Redis', 'AWS'],
        icon: 'Database',
        color: '#34c759',
        displayOrder: 3,
        featured: true,
      },
      {
        name: 'Cybersecurity & Networks',
        description: 'Network protocols, TCP/IP, OSI layers, ethical hacking, cryptographic algorithms, vulnerability assessment, and threat mitigation.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        tags: ['Security', 'Networking', 'TCP/IP', 'Cryptography', 'Ethical Hacking'],
        icon: 'Shield',
        color: '#ff9500',
        displayOrder: 4,
        featured: false,
      },
      {
        name: 'Artificial Intelligence',
        description: 'Machine learning fundamentals, neural networks, computer vision, natural language processing, and generative AI systems.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
        tags: ['AI', 'Machine Learning', 'Deep Learning', 'NLP', 'LLMs'],
        icon: 'Sparkles',
        color: '#ff2d55',
        displayOrder: 5,
        featured: true,
      },
    ];

    for (const c of defaultCategories) {
      const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await Category.create({ ...c, slug, status: 'active', isActive: true });
    }
  }
};

export default {
  listCategories,
  getCategoryById,
  getCategoryQuizzes,
  getCategoryAnalytics,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  seedDefaultCategories,
};
