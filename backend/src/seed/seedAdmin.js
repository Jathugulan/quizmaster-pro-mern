import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

export const seedAdmin = async () => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log(`[Seed] Admin already exists: ${existingAdmin.username}`);
    return existingAdmin;
  }

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
  const passwordHash = await hashPassword(adminPassword);

  const admin = await User.create({
    name: 'Platform Administrator',
    username: 'admin',
    email: 'admin@quizmaster.io',
    passwordHash,
    role: 'admin',
    status: 'active',
    photo: '',
    joinedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  console.log(`[Seed] Created default Administrator account (username: admin)`);
  return admin;
};

export const seedSampleStudents = async () => {
  const count = await User.countDocuments({ role: 'user' });
  if (count > 0) {
    console.log(`[Seed] ${count} student users already exist in database.`);
    return;
  }

  const defaultPasswordHash = await hashPassword('alex123');

  const students = [
    {
      name: 'Alex Morgan',
      username: 'alexmorgan',
      email: 'alex.morgan@example.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      status: 'active',
      joinedAt: new Date('2026-02-15T00:00:00.000Z'),
    },
    {
      name: 'Priya Sharma',
      username: 'priyasharma',
      email: 'priya.s@example.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      status: 'active',
      joinedAt: new Date('2026-03-01T00:00:00.000Z'),
    },
    {
      name: 'Marcus Chen',
      username: 'marcuschen',
      email: 'marcus.c@example.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      status: 'active',
      joinedAt: new Date('2026-03-10T00:00:00.000Z'),
    },
  ];

  await User.insertMany(students);
  console.log(`[Seed] Seeded ${students.length} sample student accounts.`);
};

export default { seedAdmin, seedSampleStudents };
