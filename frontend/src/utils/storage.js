/**
 * storage.js — client-side preferences and local storage utilities for QuizMaster.
 * All authoritative server-state (users, quizzes, questions, sessions, attempts) is
 * handled directly by the src/api/ REST client layer.
 */

const NS = 'quizmaster.v1';
const key = (k) => `${NS}.${k}`;

// ---- low-level primitives -------------------------------------------------
function read(k, fallback) {
  try {
    const raw = window.localStorage.getItem(key(k));
    return raw === null || raw === undefined ? fallback : JSON.parse(raw);
  } catch (e) {
    console.warn('[storage] read failed for', k, e);
    return fallback;
  }
}

function write(k, value) {
  try {
    window.localStorage.setItem(key(k), JSON.stringify(value));
  } catch (e) {
    console.warn('[storage] write failed for', k, e);
  }
}

function clearKey(k) {
  try {
    window.localStorage.removeItem(key(k));
  } catch (e) {
    // Ignore
  }
}

// ---- per-user preferences -----------------------------------------------------
export const DEFAULT_USER_PREFS = {
  emailNotifications: true,
  showHints: true,
  compactCards: false,
};

export function getUserPrefs(userId) {
  if (!userId) return { ...DEFAULT_USER_PREFS };
  return read(`prefs.${userId}`, { ...DEFAULT_USER_PREFS });
}

export function saveUserPrefs(userId, patch) {
  const next = { ...getUserPrefs(userId), ...patch };
  write(`prefs.${userId}`, next);
  return next;
}

// ---- theme (persisted through storage layer) ---------------------------------
export function getStoredTheme() {
  return read('theme', 'light');
}

export function setStoredTheme(theme) {
  write('theme', theme);
  return theme;
}

// ---- system settings client cache --------------------------------------------
export const DEFAULT_SETTINGS = {
  quiz: {
    defaultDurationSeconds: 600,
    defaultPassingScore: 50,
    defaultRandomize: false,
    defaultShuffleAnswers: false,
    defaultShowExplanations: true,
    defaultAllowRetake: true,
  },
  users: { allowRegistration: true, allowPhotoUpload: true },
  appearance: { accent: '#4F46E5' },
};

export function getSettings() {
  return read('settings', DEFAULT_SETTINGS);
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  write('settings', next);
  return next;
}

export default {
  getUserPrefs,
  saveUserPrefs,
  getStoredTheme,
  setStoredTheme,
  getSettings,
  saveSettings,
};