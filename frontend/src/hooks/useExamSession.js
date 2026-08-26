import { useState, useEffect, useRef, useCallback } from 'react';
import { sessionApi } from '../api/sessionApi.js';

const LOCAL_EXAM_PREFIX = 'quizmaster:exam:';

export function useExamSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const syncTimeoutRef = useRef(null);

  // Load session from Server with local offline cache fallback
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!sessionId) return;
      setLoading(true);
      setError(null);

      // Read local cache first for instant display
      let localCache = null;
      try {
        const raw = localStorage.getItem(`${LOCAL_EXAM_PREFIX}${sessionId}`);
        if (raw) localCache = JSON.parse(raw);
      } catch (e) {
        // Ignore JSON parse error
      }

      try {
        const serverSession = await sessionApi.getSession(sessionId);
        if (isMounted) {
          // Merge server state with any newer local answers
          const mergedAnswers = {
            ...(serverSession.answers || {}),
            ...(localCache?.answers || {}),
          };
          const mergedFlagged = {
            ...(serverSession.flagged || {}),
            ...(localCache?.flagged || {}),
          };
          const finalSession = {
            ...serverSession,
            answers: mergedAnswers,
            flagged: mergedFlagged,
            currentIndex: localCache?.currentIndex ?? serverSession.currentIndex ?? 0,
          };
          setSession(finalSession);
          localStorage.setItem(`${LOCAL_EXAM_PREFIX}${sessionId}`, JSON.stringify(finalSession));
        }
      } catch (err) {
        if (isMounted) {
          if (localCache) {
            setSession(localCache);
          } else {
            setError(err.message || 'Failed to load examination session');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [sessionId]);

  // Update session state instantly in local cache and debounce sync to backend
  const updateSession = useCallback(
    (patch) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };

        // Save immediately to local storage
        try {
          localStorage.setItem(`${LOCAL_EXAM_PREFIX}${sessionId}`, JSON.stringify(next));
        } catch (e) {
          console.warn('[useExamSession] LocalStorage write failed:', e);
        }

        // Debounce backend sync (500ms)
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
          try {
            await sessionApi.saveProgress(sessionId, {
              answers: next.answers,
              flagged: next.flagged,
              currentIndex: next.currentIndex,
            });
          } catch (syncErr) {
            console.warn('[useExamSession] Background progress sync failed:', syncErr.message);
          }
        }, 500);

        return next;
      });
    },
    [sessionId]
  );

  // Submit exam session to backend
  const submit = useCallback(
    async (finalAnswers = null) => {
      setIsSubmitting(true);
      try {
        const answersToSubmit = finalAnswers || session?.answers || {};
        const attempt = await sessionApi.submitSession(sessionId, answersToSubmit);
        // Clear local exam cache after successful submission
        try {
          localStorage.removeItem(`${LOCAL_EXAM_PREFIX}${sessionId}`);
        } catch (e) {
          // Ignore
        }
        return { attempt, error: null };
      } catch (err) {
        return { attempt: null, error: err };
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, session]
  );

  return {
    session,
    loading,
    error,
    isSubmitting,
    updateSession,
    submit,
  };
}

export default useExamSession;
