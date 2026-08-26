import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const listQuestions = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 20, 100);
  const filter = {};

  if (query.category && query.category !== 'all') {
    filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
  }
  if (query.difficulty && query.difficulty !== 'all') {
    filter.difficulty = query.difficulty;
  }
  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }
  if (query.isActive !== undefined && query.isActive !== 'all') {
    filter.isActive = query.isActive === 'true' || query.isActive === true;
  }
  if (query.quizId && mongoose.Types.ObjectId.isValid(query.quizId)) {
    const quiz = await Quiz.findById(query.quizId).lean();
    if (quiz) {
      filter._id = { $in: quiz.questionIds || [] };
    }
  }

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { text: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { explanation: { $regex: s, $options: 'i' } },
      { options: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(filter),
  ]);

  const formatted = questions.map((q) => ({
    id: q._id.toString(),
    text: q.text,
    category: q.category,
    difficulty: q.difficulty,
    type: q.type,
    options: q.options,
    correctIndex: q.correctIndex,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    explanation: q.explanation,
    isActive: q.isActive,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));

  return formatPaginatedResponse(formatted, total, page, limit);
};

export const getQuestionById = async (id) => {
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Question not found.');
    error.statusCode = 404;
    throw error;
  }
  const question = await Question.findById(id);
  if (!question) {
    const error = new Error('Question not found.');
    error.statusCode = 404;
    throw error;
  }
  return question.toJSON();
};

export const createQuestion = async (data) => {
  if (!data.text || !data.text.trim()) {
    const error = new Error('Question text is required.');
    error.statusCode = 422;
    throw error;
  }
  if (!Array.isArray(data.options) || data.options.length < 2) {
    const error = new Error('A question must contain at least 2 options.');
    error.statusCode = 422;
    throw error;
  }

  // Validate correctIndex bounds
  const correctIdx = Number(data.correctIndex);
  if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= data.options.length) {
    const error = new Error('correctIndex must point to a valid option index.');
    error.statusCode = 422;
    throw error;
  }

  const question = await Question.create({
    text: data.text.trim(),
    category: data.category ? data.category.trim() : 'General',
    difficulty: data.difficulty || 'Medium',
    type: data.type || 'multiple-choice',
    options: data.options.map((opt) => String(opt).trim()),
    correctIndex: correctIdx,
    marks: data.marks !== undefined ? Number(data.marks) : 1,
    negativeMarks: data.negativeMarks !== undefined ? Number(data.negativeMarks) : 0,
    explanation: data.explanation || '',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  });

  return question.toJSON();
};

export const updateQuestion = async (id, data) => {
  const question = await Question.findById(id);
  if (!question) {
    const error = new Error('Question not found.');
    error.statusCode = 404;
    throw error;
  }

  const options = data.options ? data.options.map((opt) => String(opt).trim()) : question.options;
  const correctIndex = data.correctIndex !== undefined ? Number(data.correctIndex) : question.correctIndex;

  if (correctIndex < 0 || correctIndex >= options.length) {
    const error = new Error('correctIndex must point to a valid option index.');
    error.statusCode = 422;
    throw error;
  }

  if (data.text) question.text = data.text.trim();
  if (data.category) question.category = data.category.trim();
  if (data.difficulty) question.difficulty = data.difficulty;
  if (data.type) question.type = data.type;
  if (data.options) question.options = options;
  if (data.correctIndex !== undefined) question.correctIndex = correctIndex;
  if (data.marks !== undefined) question.marks = Number(data.marks);
  if (data.negativeMarks !== undefined) question.negativeMarks = Number(data.negativeMarks);
  if (data.explanation !== undefined) question.explanation = data.explanation;
  if (data.isActive !== undefined) question.isActive = Boolean(data.isActive);

  await question.save();
  return question.toJSON();
};

export const duplicateQuestion = async (id) => {
  const original = await Question.findById(id).lean();
  if (!original) {
    const error = new Error('Question not found.');
    error.statusCode = 404;
    throw error;
  }

  const duplicated = await Question.create({
    text: `${original.text} (Copy)`,
    category: original.category,
    difficulty: original.difficulty,
    type: original.type,
    options: [...original.options],
    correctIndex: original.correctIndex,
    marks: original.marks,
    negativeMarks: original.negativeMarks,
    explanation: original.explanation,
    isActive: original.isActive,
  });

  return duplicated.toJSON();
};

export const bulkQuestionAction = async ({ action, questionIds, data = {} }) => {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    const error = new Error('No question IDs provided for bulk action.');
    error.statusCode = 422;
    throw error;
  }

  const validIds = questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  let message = '';

  switch (action) {
    case 'activate':
      await Question.updateMany({ _id: { $in: validIds } }, { isActive: true });
      message = `${validIds.length} questions activated.`;
      break;
    case 'deactivate':
      await Question.updateMany({ _id: { $in: validIds } }, { isActive: false });
      message = `${validIds.length} questions disabled.`;
      break;
    case 'changeCategory':
      if (!data.category) throw new Error('Target category is required.');
      await Question.updateMany({ _id: { $in: validIds } }, { category: data.category });
      message = `${validIds.length} questions moved to category '${data.category}'.`;
      break;
    case 'delete':
      await Question.deleteMany({ _id: { $in: validIds } });
      // Remove deleted question IDs from any quizzes
      await Quiz.updateMany({}, { $pull: { questionIds: { $in: validIds } } });
      message = `${validIds.length} questions permanently deleted.`;
      break;
    default:
      const error = new Error(`Unsupported bulk action '${action}'.`);
      error.statusCode = 400;
      throw error;
  }

  return { success: true, message, affectedCount: validIds.length };
};

export const deleteQuestion = async (id, force = false) => {
  const question = await Question.findById(id);
  if (!question) {
    const error = new Error('Question not found.');
    error.statusCode = 404;
    throw error;
  }

  if (force) {
    await Question.findByIdAndDelete(id);
    await Quiz.updateMany({}, { $pull: { questionIds: question._id } });
    return { message: 'Question permanently deleted.' };
  } else {
    question.isActive = false;
    await question.save();
    return { message: 'Question successfully disabled.' };
  }
};

export default {
  listQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  duplicateQuestion,
  bulkQuestionAction,
  deleteQuestion,
};
