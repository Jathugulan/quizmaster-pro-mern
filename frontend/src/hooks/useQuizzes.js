import { useState, useEffect, useCallback } from 'react';
import { quizApi } from '../api/quizApi.js';

export function useQuizzes(initialParams = {}) {
  const [quizzes, setQuizzes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quizApi.getQuizzes(params);
      if (res && res.items) {
        setQuizzes(res.items);
        setPagination(res.pagination);
      } else if (Array.isArray(res)) {
        setQuizzes(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, pagination, loading, error, refetch: fetchQuizzes, setParams };
}

export default useQuizzes;
