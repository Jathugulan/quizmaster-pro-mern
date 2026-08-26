import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  if (!password) throw new Error('Password is required for hashing');
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, passwordHash) => {
  if (!password || !passwordHash) return false;
  return await bcrypt.compare(password, passwordHash);
};

export default { hashPassword, comparePassword };
