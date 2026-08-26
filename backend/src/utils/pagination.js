/**
 * Pagination and query parameter extraction utility.
 */

export const getPagination = (query, defaultLimit = 10, maxLimit = 500) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const formatPaginatedResponse = (items, total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export default { getPagination, formatPaginatedResponse };
