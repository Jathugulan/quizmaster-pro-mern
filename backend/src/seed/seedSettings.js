import Setting from '../models/Setting.js';

export const seedSettings = async () => {
  const existing = await Setting.findOne();
  if (existing) {
    console.log('[Seed] System settings already configured.');
    return existing;
  }

  const settings = await Setting.create({
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
  });

  console.log('[Seed] Default system settings seeded.');
  return settings;
};

export default { seedSettings };
