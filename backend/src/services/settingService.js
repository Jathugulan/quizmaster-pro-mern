import Setting from '../models/Setting.js';

const DEFAULT_SYSTEM_SETTINGS = {
  quiz: {
    defaultDurationSeconds: 600,
    defaultPassingScore: 50,
    defaultRandomize: false,
    defaultShuffleAnswers: false,
    defaultShowExplanations: true,
    defaultAllowRetake: true,
  },
  users: {
    allowRegistration: true,
    allowPhotoUpload: true,
  },
  appearance: {
    accent: '#4F46E5',
  },
  jwtExpiration: '7d',
};

export const getSystemSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(DEFAULT_SYSTEM_SETTINGS);
  }
  return settings;
};

export const updateSystemSettings = async (patch) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({ ...DEFAULT_SYSTEM_SETTINGS, ...patch });
  } else {
    if (patch.quiz) {
      settings.quiz = { ...settings.quiz.toObject(), ...patch.quiz };
    }
    if (patch.users) {
      settings.users = { ...settings.users.toObject(), ...patch.users };
    }
    if (patch.appearance) {
      settings.appearance = { ...settings.appearance.toObject(), ...patch.appearance };
    }
    if (patch.jwtExpiration) {
      settings.jwtExpiration = patch.jwtExpiration;
    }
    await settings.save();
  }
  return settings;
};

export default { getSystemSettings, updateSystemSettings };
