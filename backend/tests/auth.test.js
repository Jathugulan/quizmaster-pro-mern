import assert from 'assert';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { signToken, verifyToken } from '../src/utils/jwt.js';

export const runAuthTests = async () => {
  console.log('🧪 Running Password & JWT Security Tests...');

  // 1. Password Hashing & Verification
  const rawPassword = 'superSecretPassword123!';
  const hash = await hashPassword(rawPassword);

  assert.notStrictEqual(hash, rawPassword, 'Hash must not equal raw password');
  assert.ok(hash.startsWith('$2'), 'Bcrypt hash should start with $2');

  const isMatchValid = await comparePassword(rawPassword, hash);
  assert.strictEqual(isMatchValid, true, 'Valid password must match hash');

  const isMatchInvalid = await comparePassword('wrongPassword', hash);
  assert.strictEqual(isMatchInvalid, false, 'Invalid password must not match hash');

  // 2. JWT Signing & Verification
  const payload = { userId: 'usr-12345', role: 'user' };
  const token = signToken(payload, '1h');
  assert.ok(typeof token === 'string' && token.length > 20, 'Token must be a non-empty string');

  const decoded = verifyToken(token);
  assert.ok(decoded, 'Decoded token should not be null');
  assert.strictEqual(decoded.userId, 'usr-12345');
  assert.strictEqual(decoded.role, 'user');

  // 3. Expired or Tampered JWT handling
  const tamperedToken = token + 'tampered';
  const decodedTampered = verifyToken(tamperedToken);
  assert.strictEqual(decodedTampered, null, 'Tampered token must fail verification');

  console.log('✅ Password & JWT Security Tests Passed Successfully.');
};

if (process.argv[1].endsWith('auth.test.js')) {
  runAuthTests();
}
