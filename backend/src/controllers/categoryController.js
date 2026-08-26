import categoryService from '../services/categoryService.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const featured = req.query.featured;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'displayOrder';
  const order = req.query.order || 'asc';
  const page = req.query.page;
  const limit = req.query.limit;

  const result = await categoryService.listCategories({
    activeOnly,
    featured,
    search,
    sortBy,
    order,
    page,
    limit,
  });

  return sendSuccess(res, result, 'Categories retrieved successfully.');
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return sendSuccess(res, category, 'Category details retrieved successfully.');
});

export const getCategoryQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await categoryService.getCategoryQuizzes(req.params.id, {
    status: req.query.status,
    search: req.query.search,
    difficulty: req.query.difficulty,
    limit: req.query.limit,
  });
  return sendSuccess(res, quizzes, 'Category quizzes retrieved successfully.');
});

export const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await categoryService.getCategoryAnalytics(req.params.id);
  return sendSuccess(res, analytics, 'Category analytics retrieved successfully.');
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user);
  return sendSuccess(res, category, 'Category created successfully.', 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.user);
  return sendSuccess(res, category, 'Category updated successfully.');
});

export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { status, isActive } = req.body;
  const targetStatus = status || (isActive ? 'active' : 'inactive');
  const category = await categoryService.updateCategoryStatus(req.params.id, targetStatus, req.user);
  return sendSuccess(res, category, 'Category status updated successfully.');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.user);
  return sendSuccess(res, result, 'Category deleted successfully.');
});

export default {
  listCategories,
  getCategoryById,
  getCategoryQuizzes,
  getCategoryAnalytics,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};
